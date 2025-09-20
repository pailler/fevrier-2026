# Script d'arrêt pour Blender virtualisé
Write-Host "🛑 Arrêt de Blender virtualisé..." -ForegroundColor Yellow

# Arrêter les services Docker
Write-Host "🐳 Arrêt des services Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.blender.yml down

Write-Host "✅ Services Blender arrêtés" -ForegroundColor Green
Write-Host "💡 Pour redémarrer: .\start-blender.ps1" -ForegroundColor Cyan

