# Script PowerShell pour démarrer HRConvert2
Write-Host "Démarrage de HRConvert2..." -ForegroundColor Green

# Démarrer le service HRConvert2 depuis le docker-compose principal
Write-Host "Démarrage du conteneur HRConvert2..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml up -d hrconvert2

# Vérifier le statut
Write-Host "Vérification du statut du conteneur..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml ps hrconvert2

Write-Host "HRConvert2 démarré sur le port 9082" -ForegroundColor Green
Write-Host "URL: http://localhost:9082" -ForegroundColor Cyan
Write-Host "URL de production: https://convert.iahome.fr" -ForegroundColor Cyan
Write-Host "Formats supportés: 200+ formats (documents, images, vidéos, audio, archives, eBooks, etc.)" -ForegroundColor Magenta
