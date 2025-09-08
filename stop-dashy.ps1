# Script d'arrêt pour Dashy
# IAHome Dashboard

Write-Host "🛑 Arrêt de Dashy - IAHome Dashboard" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

# Vérifier si Docker est en cours d'exécution
Write-Host "Vérification de Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Arrêter Dashy
Write-Host "Arrêt de Dashy..." -ForegroundColor Yellow
Set-Location "docker-services"
docker-compose -f docker-compose.dashy.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dashy arrêté avec succès!" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'arrêt de Dashy" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎯 Dashy a été arrêté" -ForegroundColor Cyan
Write-Host "Pour le redémarrer, utilisez: .\start-dashy.ps1" -ForegroundColor White
