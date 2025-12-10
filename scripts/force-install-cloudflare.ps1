# Script pour forcer l'installation de Cloudflare Tunnel
# Utilise une approche plus directe pour installer le service

$ErrorActionPreference = "Stop"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script necessite les droits administrateur" -ForegroundColor Red
    Write-Host "Relance avec elevation des droits..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  FORCE INSTALLATION CLOUDFLARE TUNNEL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Le fichier de configuration est a la racine du projet
$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"

if (-not (Test-Path $configPath)) {
    Write-Host "[ERREUR] Fichier de configuration introuvable: $configPath" -ForegroundColor Red
    exit 1
}

Write-Host "[1/6] Arret de tous les processus cloudflared..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   [OK]" -ForegroundColor Green

Write-Host "[2/6] Arret du service Windows (si existe)..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    Write-Host "   [OK] Service arrete" -ForegroundColor Green
} else {
    Write-Host "   [INFO] Service non installe" -ForegroundColor Gray
}

Write-Host "[3/6] Desinstallation de l'ancien service..." -ForegroundColor Yellow
if ($service) {
    cloudflared service uninstall 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}
Write-Host "   [OK]" -ForegroundColor Green

Write-Host "[4/6] Installation du nouveau service..." -ForegroundColor Yellow
$configFullPath = (Resolve-Path $configPath).Path
Write-Host "   Configuration: $configFullPath" -ForegroundColor Gray

try {
    $output = cloudflared service install --config $configFullPath 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERREUR] Echec de l'installation" -ForegroundColor Red
        Write-Host "   Sortie: $output" -ForegroundColor Gray
        exit 1
    }
    Write-Host "   [OK] Service installe" -ForegroundColor Green
} catch {
    Write-Host "   [ERREUR] Exception: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 3

Write-Host "[5/6] Configuration du demarrage automatique..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Set-Service -Name "cloudflared" -StartupType Automatic
    Write-Host "   [OK] Demarrage automatique configure" -ForegroundColor Green
} else {
    Write-Host "   [ERREUR] Service non trouve apres installation" -ForegroundColor Red
    exit 1
}

Write-Host "[6/6] Demarrage du service..." -ForegroundColor Yellow
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    
    $service = Get-Service -Name "cloudflared"
    if ($service.Status -eq 'Running') {
        Write-Host "   [OK] Service demarre avec succes" -ForegroundColor Green
    } else {
        Write-Host "   [AVERTISSEMENT] Service non demarre. Statut: $($service.Status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERREUR] Impossible de demarrer le service: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Essayez manuellement: Start-Service cloudflared" -ForegroundColor Yellow
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION TERMINEE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Statut du service: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Yellow'})
    Write-Host "Type de demarrage: $($service.StartType)" -ForegroundColor White
    Write-Host "Configuration: $configFullPath" -ForegroundColor White
}

Write-Host "`nSi l'erreur 1033 persiste:" -ForegroundColor Yellow
Write-Host "1. Verifiez dans Cloudflare Dashboard que le tunnel est actif" -ForegroundColor Gray
Write-Host "2. Verifiez que les domaines sont configures dans le Dashboard" -ForegroundColor Gray
Write-Host "3. Consultez les logs: Get-EventLog -LogName Application -Source cloudflared -Newest 20" -ForegroundColor Gray

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














