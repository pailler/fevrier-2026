# Script pour installer Cloudflare comme service Windows en arrière-plan
# S'exécute sans ouvrir de fenêtre PowerShell

$ErrorActionPreference = "Stop"

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "❌ Ce script DOIT être exécuté en tant qu'administrateur" -ForegroundColor Red
    exit 1
}

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# Chemins possibles pour cloudflared.exe
$cloudflaredPaths = @(
    "cloudflared.exe",
    "C:\Program Files (x86)\cloudflared\cloudflared.exe",
    "C:\Program Files\cloudflared\cloudflared.exe"
)

$cloudflaredPath = $null
foreach ($path in $cloudflaredPaths) {
    if (Test-Path $path) {
        $cloudflaredPath = (Resolve-Path $path).Path
        break
    }
}

if (-not $cloudflaredPath) {
    Write-Host "❌ cloudflared.exe introuvable" -ForegroundColor Red
    exit 1
}

# Fichier de configuration
$configFile = Join-Path $scriptDir "cloudflare-active-config.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "❌ Fichier de configuration introuvable: $configFile" -ForegroundColor Red
    exit 1
}

$configFullPath = (Resolve-Path $configFile).Path

Write-Host "🔧 Installation de Cloudflare comme service Windows..." -ForegroundColor Cyan

# 1. Arrêt du service actuel
Write-Host "1️⃣ Arrêt du service actuel..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# 2. Arrêt des processus cloudflared
Write-Host "2️⃣ Arrêt des processus cloudflared..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
}
Start-Sleep -Seconds 2

# 3. Désinstallation de l'ancien service
Write-Host "3️⃣ Désinstallation de l'ancien service..." -ForegroundColor Yellow
sc.exe delete cloudflared 2>&1 | Out-Null
Start-Sleep -Seconds 2

# 4. Installation du service avec le fichier de configuration
Write-Host "4️⃣ Installation du service avec la configuration..." -ForegroundColor Yellow
try {
    $installResult = & "$cloudflaredPath" service install --config "$configFullPath" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service installé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'installation" -ForegroundColor Red
        Write-Host "   Sortie : $installResult" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Start-Sleep -Seconds 2

# 5. Configuration du démarrage automatique
Write-Host "5️⃣ Configuration du démarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   ✅ Démarrage automatique configuré" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Impossible de configurer le démarrage automatique" -ForegroundColor Yellow
}

# 6. Démarrage du service
Write-Host "6️⃣ Démarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    $service = Get-Service -Name "cloudflared"
    if ($service.Status -eq 'Running') {
        Write-Host "   ✅ Service démarré avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Service installé mais non démarré (Statut: $($service.Status))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Essayez de démarrer manuellement : Start-Service cloudflared" -ForegroundColor Gray
}

# 7. Vérification finale
Write-Host "7️⃣ Vérification finale..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "📊 Résumé :" -ForegroundColor Cyan
Write-Host "   Service : $(if ($service) { $service.Status } else { 'Non installé' })" -ForegroundColor $(if ($service -and $service.Status -eq 'Running') { 'Green' } else { 'Yellow' })
Write-Host "   Processus : $(if ($processes) { "$($processes.Count) actif(s)" } else { 'Aucun' })" -ForegroundColor $(if ($processes) { 'Green' } else { 'Yellow' })
Write-Host "   Configuration : $configFullPath" -ForegroundColor White
Write-Host "   Démarrage : Automatique" -ForegroundColor White

if ($service -and $service.Status -eq 'Running') {
    Write-Host ""
    Write-Host "✅ Installation réussie !" -ForegroundColor Green
    Write-Host ""
    Write-Host "💡 Le service fonctionne en arrière-plan sans fenêtre PowerShell" -ForegroundColor Cyan
    Write-Host "💡 Pour vérifier : Get-Service cloudflared" -ForegroundColor Gray
    Write-Host "💡 Pour voir les logs : Get-EventLog -LogName Application -Source cloudflared -Newest 10" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "⚠️  Service installé mais non démarré" -ForegroundColor Yellow
    Write-Host "💡 Essayez : Start-Service cloudflared" -ForegroundColor Gray
}





