# Script de démarrage pour le service Converter
# Usage: .\start-converter.ps1

Write-Host "🚀 Démarrage du service Converter..." -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
try {
    docker version | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker n'est pas installé ou n'est pas accessible." -ForegroundColor Red
    exit 1
}

# Se déplacer dans le dossier converter
Set-Location $PSScriptRoot

# Démarrer les services
Write-Host "📦 Construction et démarrage des conteneurs..." -ForegroundColor Yellow
docker-compose up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Service Converter démarré avec succès!" -ForegroundColor Green
    Write-Host "🌐 Service accessible sur: http://localhost:8096" -ForegroundColor Cyan
    Write-Host "🌐 Service accessible sur: https://converter.iahome.fr" -ForegroundColor Cyan
    
    # Afficher le statut des conteneurs
    Write-Host "`n📊 Statut des conteneurs:" -ForegroundColor Yellow
    docker-compose ps
} else {
    Write-Host "❌ Erreur lors du démarrage du service Converter." -ForegroundColor Red
    exit 1
}
