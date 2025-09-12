# Script PowerShell pour arrêter HRConvert2
Write-Host "Arrêt de HRConvert2..." -ForegroundColor Red

# Arrêter le service HRConvert2 depuis le docker-compose principal
Write-Host "Arrêt du conteneur HRConvert2..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml stop hrconvert2

# Vérifier le statut
Write-Host "Vérification du statut du conteneur..." -ForegroundColor Yellow
docker-compose -f docker-compose.services.yml ps hrconvert2

Write-Host "HRConvert2 arrêté" -ForegroundColor Green
