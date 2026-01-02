# Script PowerShell pour arrêter le service d'isolation vocale

Write-Host "🛑 Arrêt du service d'isolation vocale..." -ForegroundColor Yellow

docker-compose down

Write-Host "✅ Service arrêté" -ForegroundColor Green
