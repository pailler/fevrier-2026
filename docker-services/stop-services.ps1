# Script d'arrêt des services Docker IAHome
# Usage: .\stop-services.ps1 [service_name]

param(
    [string]$Service = "all"
)

Write-Host "🛑 Arrêt des services Docker IAHome..." -ForegroundColor Yellow

# Chemin vers le fichier docker-compose
$ComposeFile = "docker-compose.services.yml"

if ($Service -eq "all") {
    Write-Host "📦 Arrêt de tous les services..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile down
    
    Write-Host "✅ Tous les services ont été arrêtés!" -ForegroundColor Green
} else {
    Write-Host "📦 Arrêt du service: $Service" -ForegroundColor Yellow
    docker-compose -f $ComposeFile stop $Service
    
    Write-Host "✅ Service $Service arrêté!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f $ComposeFile ps

Write-Host ""
Write-Host "🚀 Pour redémarrer: .\start-services.ps1" -ForegroundColor Gray










