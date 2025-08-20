# Script de déploiement production pour iahome.fr
Write-Host "🚀 Déploiement production iahome.fr" -ForegroundColor Green

# Arrêter les services existants
Write-Host "📦 Arrêt des services existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Nettoyer les images anciennes
Write-Host "🧹 Nettoyage des images anciennes..." -ForegroundColor Yellow
docker system prune -f

# Créer les dossiers nécessaires
Write-Host "📁 Création des dossiers nécessaires..." -ForegroundColor Yellow
if (!(Test-Path "logs")) { New-Item -ItemType Directory -Path "logs" }
if (!(Test-Path "letsencrypt")) { New-Item -ItemType Directory -Path "letsencrypt" }

# Construire et démarrer les services
Write-Host "🔨 Construction et démarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d --build

# Attendre que les services démarrent
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier le statut des services
Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Vérifier les logs
Write-Host "📋 Logs de l'application:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs iahome-app --tail=20

Write-Host "📋 Logs de Traefik:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs traefik --tail=20

# Test de connectivité
Write-Host "🌐 Test de connectivité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
    Write-Host "✅ Application accessible sur http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Application non accessible sur http://localhost:3000" -ForegroundColor Red
}

Write-Host "Deploiement termine!" -ForegroundColor Green
Write-Host "📍 Application accessible sur: https://iahome.fr" -ForegroundColor Cyan
Write-Host "🔧 Dashboard Traefik: http://localhost:8080" -ForegroundColor Cyan
