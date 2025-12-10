# Script pour demarrer Cloudflare Tunnel directement sans service Windows
# Solution de contournement si l'installation du service echoue

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE DIRECT CLOUDFLARE TUNNEL" -ForegroundColor Cyan
Write-Host "  (Sans service Windows)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"

# Verifier la configuration
if (-not (Test-Path $configPath)) {
    Write-Host "[ERREUR] Fichier de configuration introuvable: $configPath" -ForegroundColor Red
    exit 1
}

$configFullPath = (Resolve-Path $configPath).Path
Write-Host "[OK] Configuration: $configFullPath" -ForegroundColor Green

# Verifier cloudflared
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "[ERREUR] cloudflared non trouve dans le PATH" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] cloudflared: $($cloudflared.Source)" -ForegroundColor Green

# Arreter les processus existants
Write-Host "`n[1/3] Arret des processus existants..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   [OK] Processus arretes" -ForegroundColor Green
} else {
    Write-Host "   [OK] Aucun processus a arreter" -ForegroundColor Green
}

# Demarrer cloudflared en arriere-plan
Write-Host "`n[2/3] Demarrage de cloudflared en arriere-plan..." -ForegroundColor Yellow

$logFile = Join-Path $RootPath "cloudflared.log"
$errorFile = Join-Path $RootPath "cloudflared-error.log"

try {
    Write-Host "   Commande: $($cloudflared.Source) tunnel --config `"$configFullPath`" run" -ForegroundColor Gray
    
    # Methode 1: Start-Process avec redirection
    $processInfo = New-Object System.Diagnostics.ProcessStartInfo
    $processInfo.FileName = $cloudflared.Source
    $processInfo.Arguments = "tunnel --config `"$configFullPath`" run"
    $processInfo.WorkingDirectory = $RootPath
    $processInfo.UseShellExecute = $false
    $processInfo.RedirectStandardOutput = $true
    $processInfo.RedirectStandardError = $true
    $processInfo.CreateNoWindow = $true
    
    $process = New-Object System.Diagnostics.Process
    $process.StartInfo = $processInfo
    
    # Rediriger vers les fichiers
    $process.StartInfo.StandardOutputEncoding = [System.Text.Encoding]::UTF8
    $process.StartInfo.StandardErrorEncoding = [System.Text.Encoding]::UTF8
    
    # Creer les fichiers de log
    $logStream = [System.IO.File]::CreateText($logFile)
    $errorStream = [System.IO.File]::CreateText($errorFile)
    
    $process.add_OutputDataReceived({
        param($sender, $e)
        if ($e.Data) {
            $logStream.WriteLine($e.Data)
            $logStream.Flush()
        }
    })
    
    $process.add_ErrorDataReceived({
        param($sender, $e)
        if ($e.Data) {
            $errorStream.WriteLine($e.Data)
            $errorStream.Flush()
        }
    })
    
    $process.Start() | Out-Null
    $process.BeginOutputReadLine()
    $process.BeginErrorReadLine()
    
    Start-Sleep -Seconds 3
    
    # Verifier que le processus tourne toujours
    if (-not $process.HasExited) {
        Write-Host "   [OK] Cloudflare Tunnel demarre (PID: $($process.Id))" -ForegroundColor Green
        Write-Host "   Logs: $logFile" -ForegroundColor Gray
        Write-Host "   Erreurs: $errorFile" -ForegroundColor Gray
        
        # Sauvegarder le PID pour reference
        $pidFile = Join-Path $RootPath "cloudflared.pid"
        $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
        
    } else {
        Write-Host "   [ERREUR] Le processus s'est arrete immediatement" -ForegroundColor Red
        Write-Host "   Code de sortie: $($process.ExitCode)" -ForegroundColor Red
        
        # Fermer les streams et lire les erreurs
        $logStream.Close()
        $errorStream.Close()
        
        if (Test-Path $errorFile) {
            Write-Host "`n   Dernieres erreurs:" -ForegroundColor Yellow
            Get-Content $errorFile -Tail 20 | ForEach-Object {
                Write-Host "   $_" -ForegroundColor Red
            }
        }
        
        exit 1
    }
    
} catch {
    Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Type: $($_.Exception.GetType().FullName)" -ForegroundColor Gray
    
    # Essayer une methode plus simple
    Write-Host "`n   [TENTATIVE] Methode alternative simple..." -ForegroundColor Yellow
    
    try {
        $process = Start-Process -FilePath $cloudflared.Source `
            -ArgumentList "tunnel", "--config", $configFullPath, "run" `
            -WorkingDirectory $RootPath `
            -WindowStyle Hidden `
            -PassThru `
            -ErrorAction Stop
        
        Start-Sleep -Seconds 5
        
        if (-not $process.HasExited) {
            Write-Host "   [OK] Cloudflare Tunnel demarre avec methode alternative (PID: $($process.Id))" -ForegroundColor Green
        } else {
            Write-Host "   [ERREUR] Processus arrete. Code: $($process.ExitCode)" -ForegroundColor Red
            exit 1
        }
    } catch {
        Write-Host "   [ERREUR] Methode alternative aussi echouee: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Verification finale
Write-Host "`n[3/3] Verification..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "   [OK] Cloudflare Tunnel en cours d'execution" -ForegroundColor Green
    Write-Host "   PID: $($cloudflaredProcess.Id)" -ForegroundColor White
    Write-Host "   Demarrage: $($cloudflaredProcess.StartTime)" -ForegroundColor White
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  CLOUDFLARE TUNNEL DEMARRE" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "[INFO] Le tunnel fonctionne en arriere-plan" -ForegroundColor Cyan
    Write-Host "   Pour arreter: Stop-Process -Name cloudflared" -ForegroundColor Gray
    Write-Host "   Pour voir les logs: Get-Content $logFile -Tail 50" -ForegroundColor Gray
    
    Write-Host "`n[INFO] Attendez 30-60 secondes pour que le tunnel se connecte" -ForegroundColor Yellow
    Write-Host "   Verifiez dans Cloudflare Dashboard que le tunnel est 'Healthy'" -ForegroundColor Gray
    
} else {
    Write-Host "   [ERREUR] Cloudflare Tunnel n'a pas demarre" -ForegroundColor Red
    Write-Host "   Consultez les logs d'erreur: $errorFile" -ForegroundColor Yellow
    
    if (Test-Path $errorFile) {
        Write-Host "`n   Dernieres erreurs:" -ForegroundColor Yellow
        Get-Content $errorFile -Tail 10 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor Red
        }
    }
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

