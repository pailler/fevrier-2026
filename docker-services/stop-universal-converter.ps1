# Script d'arrêt pour le Convertisseur Universel v1
# IAHome - Convertisseur Universel

Write-Host "🛑 Arrêt du Convertisseur Universel v1 - IAHome..." -ForegroundColor Red

# Arrêter le service
Write-Host "🐳 Arrêt du service..." -ForegroundColor Yellow
docker-compose -f docker-compose.universal-converter.yml down

# Vérifier l'arrêt
Write-Host "🔍 Vérification de l'arrêt du service..." -ForegroundColor Yellow

$status = docker-compose -f docker-compose.universal-converter.yml ps universal-converter --format "table {{.Service}}\t{{.Status}}"
Write-Host "  $status" -ForegroundColor Blue

Write-Host "`n✅ Convertisseur Universel v1 arrêté avec succès !" -ForegroundColor Green

Write-Host "`n📋 Commandes utiles :" -ForegroundColor Yellow
Write-Host "  - Redémarrer: .\start-universal-converter.ps1" -ForegroundColor Gray
Write-Host "  - Supprimer les conteneurs: docker-compose -f docker-compose.universal-converter.yml rm -f" -ForegroundColor Gray
Write-Host "  - Voir tous les services: docker-compose -f docker-compose.universal-converter.yml ps" -ForegroundColor Gray
Write-Host "  - Nettoyer les images: docker system prune -f" -ForegroundColor Gray
