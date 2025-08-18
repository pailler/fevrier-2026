# Script de demarrage des services Docker IAHome
# Usage: .\start-services.ps1 [service_name]

param(
    [string]$Service = "all"
)

Write-Host "Demarrage des services Docker IAHome..." -ForegroundColor Green

# Verifier si Docker est en cours d'execution
try {
    docker version | Out-Null
} catch {
    Write-Host "Docker n'est pas en cours d'execution. Veuillez demarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Chemin vers le fichier docker-compose
$ComposeFile = "docker-compose.services.yml"

if ($Service -eq "all") {
    Write-Host "Demarrage de tous les services..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile up -d
    
    Write-Host "Tous les services ont ete demarres!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Services disponibles:" -ForegroundColor Cyan
    Write-Host "  Stirling-PDF: http://localhost:8081 (pdf.iahome.fr)" -ForegroundColor White
    Write-Host "  MeTube: http://localhost:8082 (metube.iahome.fr)" -ForegroundColor White
    Write-Host "  LibreSpeed: http://localhost:8083 (librespeed.regispailler.fr)" -ForegroundColor White
    Write-Host "  PSITransfer: http://localhost:8084 (psitransfer.regispailler.fr)" -ForegroundColor White
    Write-Host "  Portainer: http://localhost:8085 (portainer.iahome.fr)" -ForegroundColor White
    Write-Host "  Polr: http://localhost:8086 (qrcode.regispailler.fr)" -ForegroundColor White
} else {
    Write-Host "Demarrage du service: $Service" -ForegroundColor Yellow
    docker-compose -f $ComposeFile up -d $Service
    
    Write-Host "Service $Service demarre!" -ForegroundColor Green
}

Write-Host ""
Write-Host "Verification du statut des services..." -ForegroundColor Yellow
docker-compose -f $ComposeFile ps

Write-Host ""
Write-Host "Pour voir les logs: docker-compose -f $ComposeFile logs -f [service_name]" -ForegroundColor Gray
Write-Host "Pour arreter: docker-compose -f $ComposeFile down" -ForegroundColor Gray
