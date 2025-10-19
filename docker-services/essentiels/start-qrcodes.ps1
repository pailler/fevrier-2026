#!/usr/bin/env pwsh
# Script de démarrage pour le service QR Codes dynamiques

Write-Host "🚀 Démarrage du service QR Codes dynamiques..." -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Desktop n'est pas en cours d'exécution. Veuillez le démarrer d'abord." -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire des essentiels
Set-Location "C:\Users\AAA\Documents\iahome\docker-services\essentiels"

# Construire et démarrer le service QR codes
Write-Host "🔨 Construction de l'image QR Codes..." -ForegroundColor Yellow
docker-compose build qrcodes

Write-Host "🚀 Démarrage du service QR Codes..." -ForegroundColor Yellow
docker-compose up -d qrcodes

# Vérifier le statut
Start-Sleep -Seconds 5
$status = docker-compose ps qrcodes
Write-Host "📊 Statut du service QR Codes:" -ForegroundColor Cyan
Write-Host $status

# Vérifier les logs
Write-Host "📋 Logs du service QR Codes:" -ForegroundColor Cyan
docker-compose logs --tail=10 qrcodes

Write-Host "✅ Service QR Codes démarré avec succès!" -ForegroundColor Green
Write-Host "🌐 Interface web: http://localhost:7006" -ForegroundColor Blue
Write-Host "📡 API: http://localhost:7006/api/qr" -ForegroundColor Blue
Write-Host "❤️  Health check: http://localhost:7006/health" -ForegroundColor Blue
