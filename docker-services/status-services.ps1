# Script d'affichage du statut des services Docker IAHome
# Usage: .\status-services.ps1

Write-Host "Statut des services Docker IAHome..." -ForegroundColor Cyan

# Chemin vers le fichier docker-compose
$ComposeFile = "docker-compose.services.yml"

# Vérifier si Docker est en cours d'exécution
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution." -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Statut des conteneurs:" -ForegroundColor Yellow
docker-compose -f $ComposeFile ps

Write-Host ""
Write-Host "Services disponibles:" -ForegroundColor Green
Write-Host "  • Stirling-PDF: http://localhost:8081 (pdf.iahome.fr)" -ForegroundColor White
Write-Host "  • MeTube: http://localhost:8082 (metube.iahome.fr)" -ForegroundColor White
Write-Host "  • LibreSpeed: http://localhost:8083 (librespeed.regispailler.fr)" -ForegroundColor White
Write-Host "  • PSITransfer: http://localhost:8084 (psitransfer.regispailler.fr)" -ForegroundColor White
Write-Host "  • Portainer: http://localhost:8085 (portainer.iahome.fr)" -ForegroundColor White
Write-Host "  • Polr: http://localhost:8086 (qrcode.regispailler.fr)" -ForegroundColor White

Write-Host ""
Write-Host "Commandes utiles:" -ForegroundColor Gray
Write-Host "  .\start-services.ps1     # Démarrer tous les services" -ForegroundColor White
Write-Host "  .\stop-services.ps1      # Arrêter tous les services" -ForegroundColor White
Write-Host "  .\restart-services.ps1   # Redémarrer tous les services" -ForegroundColor White
Write-Host "  .\update-services.ps1    # Mettre à jour les services" -ForegroundColor White
Write-Host "  .\logs-services.ps1      # Voir les logs" -ForegroundColor White
