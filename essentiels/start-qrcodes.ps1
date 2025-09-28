# Script de démarrage pour le service QR Codes
Write-Host "🚀 Démarrage du service QR Codes..." -ForegroundColor Green

# Aller dans le dossier qrcodes
Set-Location -Path "qrcodes"

# Vérifier si Docker est en cours d'exécution
try {
    docker version | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Arrêter les containers existants s'ils existent
Write-Host "🛑 Arrêt des containers existants..." -ForegroundColor Yellow
docker-compose down 2>$null

# Construire et démarrer les services
Write-Host "🔨 Construction et démarrage des services QR Codes..." -ForegroundColor Blue
docker-compose up -d --build

# Vérifier le statut des containers
Write-Host "📊 Vérification du statut des containers..." -ForegroundColor Cyan
docker-compose ps

Write-Host "✅ Service QR Codes démarré avec succès!" -ForegroundColor Green
Write-Host "🌐 Service disponible sur: http://localhost:7005" -ForegroundColor Blue
Write-Host "📊 Base de données PostgreSQL sur le port: 5433" -ForegroundColor Blue

# Revenir au dossier parent
Set-Location -Path ".."

