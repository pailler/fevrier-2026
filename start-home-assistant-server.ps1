# Script de démarrage du serveur Home Assistant
Write-Host "🏠 Démarrage du serveur Home Assistant..." -ForegroundColor Green

# Vérifier si le port 8123 est déjà utilisé
$portInUse = Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Host "⚠️  Le port 8123 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Arrêt du processus existant..." -ForegroundColor Yellow
    $process = Get-Process -Id ($portInUse.OwningProcess) -ErrorAction SilentlyContinue
    if ($process) {
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}

# Aller dans le dossier codes-ha
$codesHaPath = Join-Path $PSScriptRoot "essentiels\codes-ha"
if (-not (Test-Path $codesHaPath)) {
    Write-Host "❌ Dossier introuvable: $codesHaPath" -ForegroundColor Red
    exit 1
}

Set-Location $codesHaPath

Write-Host "📂 Dossier: $codesHaPath" -ForegroundColor Cyan
Write-Host "🌐 Démarrage du serveur HTTP sur le port 8123..." -ForegroundColor Cyan

# Démarrer le serveur HTTP Python
try {
    # Vérifier si Python est disponible
    $pythonVersion = python --version 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
        Write-Host "🚀 Serveur démarré sur http://localhost:8123" -ForegroundColor Green
        Write-Host "🌐 Production: https://homeassistant.iahome.fr" -ForegroundColor Green
        Write-Host "`nAppuyez sur Ctrl+C pour arrêter le serveur" -ForegroundColor Yellow
        python -m http.server 8123
    } else {
        Write-Host "❌ Python n'est pas installé ou pas dans le PATH" -ForegroundColor Red
        Write-Host "💡 Installez Python ou utilisez Node.js avec http-server" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage du serveur: $_" -ForegroundColor Red
    exit 1
}

