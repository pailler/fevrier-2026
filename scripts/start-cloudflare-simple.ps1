# Script simple pour demarrer Cloudflare Tunnel
# Methode la plus directe possible

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE SIMPLE CLOUDFLARE TUNNEL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"

if (-not (Test-Path $configPath)) {
    Write-Host "[ERREUR] Configuration introuvable: $configPath" -ForegroundColor Red
    exit 1
}

$configFullPath = (Resolve-Path $configPath).Path
Write-Host "[OK] Configuration: $configFullPath" -ForegroundColor Green

# Verifier cloudflared
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "[ERREUR] cloudflared non trouve" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] cloudflared: $($cloudflared.Source)" -ForegroundColor Green

# Arreter les processus existants
Write-Host "`n[1/2] Arret des processus existants..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   [OK]" -ForegroundColor Green

# Demarrer cloudflared de la maniere la plus simple
Write-Host "`n[2/2] Demarrage de cloudflared..." -ForegroundColor Yellow

# Changer vers le repertoire racine
Push-Location $RootPath

try {
    # Methode la plus simple: Start-Process sans redirection complexe
    Write-Host "   Commande: cloudflared tunnel --config `"$configFullPath`" run" -ForegroundColor Gray
    
    $process = Start-Process -FilePath $cloudflared.Source `
        -ArgumentList "tunnel", "--config", $configFullPath, "run" `
        -WorkingDirectory $RootPath `
        -WindowStyle Hidden `
        -PassThru `
        -ErrorAction Stop
    
    Write-Host "   Processus cree (PID: $($process.Id))" -ForegroundColor Gray
    
    # Attendre un peu
    Start-Sleep -Seconds 5
    
    # Verifier que le processus tourne toujours
    if (-not $process.HasExited) {
        # Verifier aussi avec Get-Process
        $cloudflaredProcess = Get-Process -Id $process.Id -ErrorAction SilentlyContinue
        if ($cloudflaredProcess) {
            Write-Host "   [OK] Cloudflare Tunnel demarre (PID: $($process.Id))" -ForegroundColor Green
            
            # Sauvegarder le PID
            $pidFile = Join-Path $RootPath "cloudflared.pid"
            $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
            Write-Host "   PID sauvegarde dans: $pidFile" -ForegroundColor Gray
            
            Write-Host "`n========================================" -ForegroundColor Green
            Write-Host "  CLOUDFLARE TUNNEL DEMARRE" -ForegroundColor Green
            Write-Host "========================================`n" -ForegroundColor Green
            
            Write-Host "[INFO] Le tunnel fonctionne en arriere-plan" -ForegroundColor Cyan
            Write-Host "   Pour arreter: Stop-Process -Id $($process.Id)" -ForegroundColor Gray
            Write-Host "   Ou: Get-Process -Name cloudflared | Stop-Process" -ForegroundColor Gray
            
            Write-Host "`n[INFO] Attendez 30-60 secondes pour que le tunnel se connecte" -ForegroundColor Yellow
            Write-Host "   Verifiez dans Cloudflare Dashboard que le tunnel est 'Healthy'" -ForegroundColor Gray
            
        } else {
            Write-Host "   [ERREUR] Processus non trouve apres demarrage" -ForegroundColor Red
        }
    } else {
        Write-Host "   [ERREUR] Le processus s'est arrete immediatement" -ForegroundColor Red
        Write-Host "   Code de sortie: $($process.ExitCode)" -ForegroundColor Red
        
        # Essayer de voir l'erreur en demarrant en mode visible
        Write-Host "`n   [TENTATIVE] Demarrage en mode visible pour voir l'erreur..." -ForegroundColor Yellow
        Start-Process -FilePath $cloudflared.Source `
            -ArgumentList "tunnel", "--config", $configFullPath, "run" `
            -WorkingDirectory $RootPath `
            -NoNewWindow `
            -Wait `
            -ErrorAction Stop
        
        Write-Host "   [INFO] Une fenetre s'est ouverte pour afficher l'erreur" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Type: $($_.Exception.GetType().FullName)" -ForegroundColor Gray
    
    # Essayer de tester la commande directement
    Write-Host "`n   [TEST] Test de la commande cloudflared..." -ForegroundColor Yellow
    $testOutput = & $cloudflared.Source tunnel --config $configFullPath --help 2>&1
    Write-Host "   Sortie du test:" -ForegroundColor Gray
    $testOutput | Select-Object -First 5 | ForEach-Object {
        Write-Host "   $_" -ForegroundColor White
    }
    
} finally {
    Pop-Location
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














