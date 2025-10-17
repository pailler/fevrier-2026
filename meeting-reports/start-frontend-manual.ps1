# Script de démarrage manuel du frontend
Write-Host "🚀 Démarrage manuel du frontend..." -ForegroundColor Green

# Aller dans le répertoire frontend
Set-Location "C:\Users\AAA\Documents\iahome\meeting-reports\frontend"

# Définir les variables d'environnement
$env:PORT = "3001"
$env:HOST = "localhost"
$env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
$env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"
$env:PUBLIC_URL = "https://meeting-reports.iahome.fr"

Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "  PORT: $env:PORT" -ForegroundColor White
Write-Host "  HOST: $env:HOST" -ForegroundColor White
Write-Host "  API_URL: $env:REACT_APP_API_URL" -ForegroundColor White
Write-Host "  PUBLIC_URL: $env:PUBLIC_URL" -ForegroundColor White

Write-Host "`nDémarrage de React..." -ForegroundColor Yellow
npm start
