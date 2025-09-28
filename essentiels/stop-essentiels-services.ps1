# Script d'arrêt des services essentiels
# MeTube, Stirling PDF, Librespeed

Write-Host "🛑 Arrêt des services essentiels..." -ForegroundColor Yellow

# Arrêter les services essentiels
Write-Host "📦 Arrêt des conteneurs..." -ForegroundColor Yellow
docker-compose -f docker-compose.essentiels.yml down

Write-Host "✅ Services essentiels arrêtés !" -ForegroundColor Green











