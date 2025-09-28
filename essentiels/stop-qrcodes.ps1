# Script d'arrêt pour le service QR Codes
Write-Host "🛑 Arrêt du service QR Codes..." -ForegroundColor Yellow

# Aller dans le dossier qrcodes
Set-Location -Path "qrcodes"

# Arrêter les containers
Write-Host "🛑 Arrêt des containers QR Codes..." -ForegroundColor Yellow
docker-compose down

# Vérifier le statut
Write-Host "📊 Vérification du statut..." -ForegroundColor Cyan
docker-compose ps

Write-Host "✅ Service QR Codes arrêté avec succès!" -ForegroundColor Green

# Revenir au dossier parent
Set-Location -Path ".."

