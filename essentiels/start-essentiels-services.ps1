# Script de démarrage des services essentiels
# MeTube, Stirling PDF, Librespeed

Write-Host "🚀 Démarrage des services essentiels..." -ForegroundColor Green

# Vérifier que Docker est démarré
if (!(docker info 2>$null)) {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Arrêter les conteneurs existants s'ils existent
Write-Host "📦 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker stop metube stirling-pdf librespeed-secure 2>$null
docker rm metube stirling-pdf librespeed-secure 2>$null

# Démarrer les services essentiels
Write-Host "🚀 Démarrage des services essentiels..." -ForegroundColor Green
docker-compose -f docker-compose.essentiels.yml up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier la santé des services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Green
docker-compose -f docker-compose.essentiels.yml ps

Write-Host ""
Write-Host "✅ Services essentiels démarrés !" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services accessibles:" -ForegroundColor Cyan
Write-Host "   - MeTube: http://localhost:8081" -ForegroundColor White
Write-Host "   - Stirling PDF: http://localhost:8082" -ForegroundColor White
Write-Host "   - Librespeed: http://localhost:8083" -ForegroundColor White
Write-Host ""
Write-Host "📝 Pour arrêter les services:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.essentiels.yml down" -ForegroundColor White











