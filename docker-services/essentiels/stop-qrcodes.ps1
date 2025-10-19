#!/usr/bin/env pwsh
# Script d'arrêt pour le service QR Codes dynamiques

Write-Host "🛑 Arrêt du service QR Codes dynamiques..." -ForegroundColor Yellow

# Aller dans le répertoire des essentiels
Set-Location "C:\Users\AAA\Documents\iahome\docker-services\essentiels"

# Arrêter le service QR codes
Write-Host "🛑 Arrêt du service QR Codes..." -ForegroundColor Yellow
docker-compose stop qrcodes

# Supprimer le conteneur
Write-Host "🗑️ Suppression du conteneur QR Codes..." -ForegroundColor Yellow
docker-compose rm -f qrcodes

Write-Host "✅ Service QR Codes arrêté avec succès!" -ForegroundColor Green
