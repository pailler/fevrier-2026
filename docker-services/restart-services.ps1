# Script de redémarrage des services Docker IAHome
# Usage: .\restart-services.ps1 [service_name]

param(
    [string]$Service = "all"
)

Write-Host "🔄 Redémarrage des services Docker IAHome..." -ForegroundColor Blue

# Chemin vers le fichier docker-compose
$ComposeFile = "docker-compose.services.yml"

if ($Service -eq "all") {
    Write-Host "📦 Redémarrage de tous les services..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile restart
    
    Write-Host "✅ Tous les services ont été redémarrés!" -ForegroundColor Green
} else {
    Write-Host "📦 Redémarrage du service: $Service" -ForegroundColor Yellow
    docker-compose -f $ComposeFile restart $Service
    
    Write-Host "✅ Service $Service redémarré!" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f $ComposeFile ps

Write-Host ""
Write-Host "📝 Pour voir les logs: docker-compose -f $ComposeFile logs -f [service_name]" -ForegroundColor Gray










