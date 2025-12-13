# Script simple pour installer le service Cloudflare
# DOIT etre execute en tant qu'administrateur

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION DU SERVICE CLOUDFLARE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERREUR: Ce script DOIT etre execute en tant qu'administrateur" -ForegroundColor Red
    Write-Host ""
    Write-Host "Pour executer :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell -> Executer en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "2. Naviguez vers : cd '$PSScriptRoot'" -ForegroundColor Gray
    Write-Host "3. Executez : .\install-cloudflare-service-simple.ps1" -ForegroundColor Gray
    exit 1
}

# Chemins
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    $cloudflaredPath = Join-Path $PSScriptRoot "cloudflared.exe"
}

$configPath = Join-Path $PSScriptRoot "cloudflare-active-config.yml"

# Verifications
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host ""
    Write-Host "ERREUR: cloudflared.exe non trouve a : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path $configPath)) {
    Write-Host ""
    Write-Host "ERREUR: Fichier de configuration non trouve : $configPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "OK: cloudflared trouve : $cloudflaredPath" -ForegroundColor Green
Write-Host "OK: Configuration trouvee : $configPath" -ForegroundColor Green

# Installation du service
Write-Host ""
Write-Host "Installation du service..." -ForegroundColor Yellow
$configFullPath = (Resolve-Path $configPath).Path

try {
    $result = & "$cloudflaredPath" service install --config $configFullPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Service installe avec succes" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: Erreur lors de l'installation" -ForegroundColor Red
        Write-Host "   Sortie : $result" -ForegroundColor Yellow
        pause
        exit 1
    }
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Configuration du demarrage automatique
Write-Host ""
Write-Host "Configuration du demarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   OK: Demarrage automatique configure" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: Erreur lors de la configuration : $($_.Exception.Message)" -ForegroundColor Yellow
}

# Demarrage du service
Write-Host ""
Write-Host "Demarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    $service = Get-Service -Name "cloudflared"
    Write-Host "   OK: Service demarre - Statut : $($service.Status)" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR: Erreur lors du demarrage : $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Verification finale
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue

if ($service) {
    $serviceStatus = $service.Status
    $serviceStartType = $service.StartType
    Write-Host "   Service : $serviceStatus" -ForegroundColor $(if ($serviceStatus -eq 'Running') {'Green'} else {'Red'})
    Write-Host "   Demarrage : $serviceStartType" -ForegroundColor White
} else {
    Write-Host "   Service : Non trouve" -ForegroundColor Red
}

if ($processes) {
    $processCount = $processes.Count
    $processPids = $processes.Id -join ', '
    if ($processCount -eq 1) {
        $processText = "$processCount processus actif"
    } else {
        $processText = "$processCount processus actifs"
    }
    Write-Host "   $processText (PID: $processPids)" -ForegroundColor Green
} else {
    Write-Host "   Processus : Aucun" -ForegroundColor Yellow
}

if ($service -and $service.Status -eq 'Running' -and $processes) {
    Write-Host ""
    Write-Host "SUCCES: SERVICE CLOUDFLARE INSTALLE ET DEMARRE AVEC SUCCES!" -ForegroundColor Green
} elseif ($service -and $service.Status -eq 'Running') {
    Write-Host ""
    Write-Host "ATTENTION: Le service est demarre mais aucun processus detecte" -ForegroundColor Yellow
    Write-Host "   Attendez quelques secondes et verifiez avec: Get-Process cloudflared" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "ATTENTION: Le service est installe mais peut necessiter un redemarrage" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "   1. Attendez 2-3 minutes pour que le tunnel se connecte" -ForegroundColor White
Write-Host "   2. Verifiez dans Cloudflare Dashboard :" -ForegroundColor White
Write-Host "      https://one.dash.cloudflare.com/" -ForegroundColor Gray
Write-Host "      Zero Trust -> Networks -> Tunnels -> iahome-new" -ForegroundColor Gray
Write-Host "   3. Le statut devrait passer a 'Healthy'" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
