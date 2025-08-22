# Script d'affichage des logs des services Docker IAHome
# Usage: .\logs-services.ps1 [service_name]

param(
    [string]$Service = "all",
    [switch]$Follow
)

Write-Host "📝 Affichage des logs des services Docker IAHome..." -ForegroundColor Cyan

# Chemin vers le fichier docker-compose
$ComposeFile = "docker-compose.services.yml"

if ($Service -eq "all") {
    Write-Host "📋 Logs de tous les services:" -ForegroundColor Yellow
    if ($Follow) {
        docker-compose -f $ComposeFile logs -f
    } else {
        docker-compose -f $ComposeFile logs
    }
} else {
    Write-Host "📋 Logs du service: $Service" -ForegroundColor Yellow
    if ($Follow) {
        docker-compose -f $ComposeFile logs -f $Service
    } else {
        docker-compose -f $ComposeFile logs $Service
    }
}

Write-Host ""
Write-Host "💡 Utilisation:" -ForegroundColor Gray
Write-Host "  .\logs-services.ps1                    # Logs de tous les services" -ForegroundColor White
Write-Host "  .\logs-services.ps1 polr              # Logs du service Polr" -ForegroundColor White
Write-Host "  .\logs-services.ps1 polr -Follow      # Logs en temps réel" -ForegroundColor White







