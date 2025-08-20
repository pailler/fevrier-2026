# Script de deploiement des services externes pour iahome.fr
Write-Host "Deploiement des services externes" -ForegroundColor Green

# Verifier si le dossier docker-services existe
if (!(Test-Path "docker-services")) {
    Write-Host "Dossier docker-services non trouve!" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier docker-services
Set-Location docker-services

# Arreter les services existants
Write-Host "Arret des services existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml down

# Creer les dossiers necessaires
Write-Host "Creation des dossiers necessaires..." -ForegroundColor Yellow
$folders = @("pdf-data", "pdf-uploads", "pdf-temp", "metube-downloads", "psitransfer-data", "polr-data", "polr-db-data")
foreach ($folder in $folders) {
    if (!(Test-Path $folder)) { 
        New-Item -ItemType Directory -Path $folder 
        Write-Host "Cree: $folder" -ForegroundColor Green
    }
}

# Construire et demarrer les services
Write-Host "Demarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml up -d

# Attendre que les services demarrent
Write-Host "Attente du demarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Verifier le statut des services
Write-Host "Verification du statut des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml ps

# Afficher les URLs des services
Write-Host "Services deployes:" -ForegroundColor Cyan
Write-Host "   Stirling-PDF: http://localhost:8081" -ForegroundColor White
Write-Host "   MeTube: http://localhost:8082" -ForegroundColor White
Write-Host "   LibreSpeed: http://localhost:8083" -ForegroundColor White
Write-Host "   PSITransfer: http://localhost:8084" -ForegroundColor White
Write-Host "   Polr (QRCode): http://localhost:8086" -ForegroundColor White

# Retourner au dossier parent
Set-Location ..

Write-Host "Services externes deployes!" -ForegroundColor Green
