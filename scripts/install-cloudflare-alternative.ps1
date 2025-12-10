# Script d'installation alternative de Cloudflare Tunnel
# Utilise une methode differente si l'installation standard echoue

$ErrorActionPreference = "Continue"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script necessite les droits administrateur" -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION ALTERNATIVE CLOUDFLARE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"
$configFullPath = (Resolve-Path $configPath).Path

# Methode 1: Installation avec le chemin absolu de cloudflared
Write-Host "[METHODE 1] Installation avec chemin absolu..." -ForegroundColor Yellow
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if ($cloudflared) {
    $cloudflaredExe = $cloudflared.Source
    Write-Host "   Utilisation de: $cloudflaredExe" -ForegroundColor Gray
    
    # Changer vers le repertoire de cloudflared
    $cloudflaredDir = Split-Path $cloudflaredExe -Parent
    Push-Location $cloudflaredDir
    
    try {
        Write-Host "   Commande: .\cloudflared.exe service install --config `"$configFullPath`"" -ForegroundColor Gray
        $output = & .\cloudflared.exe service install --config $configFullPath 2>&1
        
        Write-Host "   Sortie:" -ForegroundColor Gray
        $output | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   [OK] Installation reussie avec methode 1" -ForegroundColor Green
            Pop-Location
            Start-Sleep -Seconds 5
            
            $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
            if ($service) {
                Write-Host "`n[SUCCES] Service installe et trouve!" -ForegroundColor Green
                Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction SilentlyContinue
                Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
                exit 0
            }
        } else {
            Write-Host "   [ECHEC] Code de retour: $LASTEXITCODE" -ForegroundColor Red
        }
    } catch {
        Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Methode 2: Installation avec sc.exe directement
Write-Host "`n[METHODE 2] Installation avec sc.exe..." -ForegroundColor Yellow
if ($cloudflared) {
    $cloudflaredExe = $cloudflared.Source
    
    try {
        Write-Host "   Creation du service avec sc.exe..." -ForegroundColor Gray
        
        # Desinstaller d'abord si existe
        sc delete cloudflared 2>&1 | Out-Null
        Start-Sleep -Seconds 2
        
        # Creer le service avec sc.exe
        $serviceArgs = "tunnel run --config `"$configFullPath`""
        $scCommand = "sc create cloudflared binPath= `"$cloudflaredExe $serviceArgs`" start= auto"
        
        Write-Host "   Commande: $scCommand" -ForegroundColor Gray
        Invoke-Expression $scCommand 2>&1 | ForEach-Object {
            Write-Host "   $_" -ForegroundColor White
        }
        
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "   [OK] Service cree avec sc.exe" -ForegroundColor Green
            Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction SilentlyContinue
            Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
            Write-Host "`n[SUCCES] Service installe avec methode 2!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "   [ECHEC] Service non cree" -ForegroundColor Red
        }
    } catch {
        Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Methode 3: Installation avec New-Service (PowerShell)
Write-Host "`n[METHODE 3] Installation avec New-Service (PowerShell)..." -ForegroundColor Yellow
if ($cloudflared) {
    $cloudflaredExe = $cloudflared.Source
    
    try {
        Write-Host "   Suppression de l'ancien service si existe..." -ForegroundColor Gray
        $oldService = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($oldService) {
            Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
            sc delete cloudflared 2>&1 | Out-Null
            Start-Sleep -Seconds 2
        }
        
        Write-Host "   Creation du service avec New-Service..." -ForegroundColor Gray
        $serviceArgs = "tunnel run --config `"$configFullPath`""
        $binPath = "$cloudflaredExe $serviceArgs"
        
        New-Service -Name "cloudflared" `
            -BinaryPathName $binPath `
            -DisplayName "Cloudflare Tunnel" `
            -Description "Cloudflare Tunnel Service" `
            -StartupType Automatic `
            -ErrorAction Stop | Out-Null
        
        Start-Sleep -Seconds 3
        
        $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($service) {
            Write-Host "   [OK] Service cree avec New-Service" -ForegroundColor Green
            Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
            Write-Host "`n[SUCCES] Service installe avec methode 3!" -ForegroundColor Green
            exit 0
        } else {
            Write-Host "   [ECHEC] Service non cree" -ForegroundColor Red
        }
    } catch {
        Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "   Type: $($_.Exception.GetType().FullName)" -ForegroundColor Gray
    }
}

# Si toutes les methodes ont echoue
Write-Host "`n========================================" -ForegroundColor Red
Write-Host "  TOUTES LES METHODES ONT ECHOUE" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

Write-Host "[DIAGNOSTIC] Verifiez:" -ForegroundColor Yellow
Write-Host "1. Que cloudflared.exe peut creer des services Windows" -ForegroundColor Gray
Write-Host "2. Les permissions sur le fichier de configuration" -ForegroundColor Gray
Write-Host "3. Les logs Windows Event Viewer" -ForegroundColor Gray
Write-Host "4. Executez manuellement: cloudflared service install --config `"$configFullPath`"" -ForegroundColor Gray

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














