# Script d'arrêt en production pour IAHome
# Compatible Windows PowerShell

Write-Host "🛑 Arrêt des services IAHome en production..." -ForegroundColor Yellow

# Arrêter les services externes
Write-Host "🔧 Arrêt des services externes..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml down

# Arrêter les services principaux
Write-Host "🚀 Arrêt des services principaux..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Vérifier qu'aucun conteneur ne tourne
Write-Host "🔍 Vérification des conteneurs..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}"
if ($containers -match "iahome|stirling-pdf|metube|librespeed|psitransfer|polr") {
    Write-Host "⚠️  Certains conteneurs sont encore en cours d'exécution:" -ForegroundColor Red
    docker ps --filter "name=iahome|stirling-pdf|metube|librespeed|psitransfer|polr"
} else {
    Write-Host "✅ Tous les conteneurs IAHome sont arrêtés" -ForegroundColor Green
}

Write-Host "✅ Arrêt terminé !" -ForegroundColor Green
