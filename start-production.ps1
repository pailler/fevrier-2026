# Script de démarrage en production pour IAHome
# Compatible Windows PowerShell

Write-Host "🚀 Démarrage IAHome en mode production..." -ForegroundColor Green

# Vérifier que Docker Desktop est démarré
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Arrêter les conteneurs existants
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images obsolètes..." -ForegroundColor Yellow
docker system prune -f

# Reconstruire l'image avec --no-cache
Write-Host "🔨 Reconstruction de l'image..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services principaux
Write-Host "🚀 Démarrage des services principaux..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Démarrer les services externes
Write-Host "🔧 Démarrage des services externes..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier la santé des services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Test de l'API de santé
Write-Host "🔍 Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    Write-Host "✅ API de santé accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ L'API de santé n'est pas accessible" -ForegroundColor Red
}

# Vérifier les logs
Write-Host "📋 Logs récents:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=10

Write-Host "✅ Démarrage terminé !" -ForegroundColor Green
Write-Host "🌐 Votre application est accessible sur: https://iahome.fr" -ForegroundColor Cyan
Write-Host "📊 Dashboard Traefik: http://localhost:8080" -ForegroundColor Cyan
Write-Host "📄 PDF Service: https://pdf.regispailler.fr" -ForegroundColor Cyan
Write-Host "🎥 MeTube Service: https://metube.regispailler.fr" -ForegroundColor Cyan
Write-Host "⚡ LibreSpeed Service: https://librespeed.regispailler.fr" -ForegroundColor Cyan
Write-Host "📤 PsiTransfer Service: https://psitransfer.regispailler.fr" -ForegroundColor Cyan
Write-Host "🔗 QR Code Service: https://qrcode.regispailler.fr" -ForegroundColor Cyan
