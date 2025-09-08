# Script de déploiement final pour IAHome en production
# Avec Cloudflare Tunnel et sécurisation complète

Write-Host "🚀 Déploiement IAHome en production avec Cloudflare Tunnel..." -ForegroundColor Green

# Vérifier que Docker est démarré
try {
    docker info | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Créer le réseau externe partagé
Write-Host "🌐 Création du réseau Docker partagé..." -ForegroundColor Yellow
try {
    docker network create services-network
    Write-Host "✅ Réseau services-network créé" -ForegroundColor Green
} catch {
    Write-Host "✅ Réseau services-network existe déjà" -ForegroundColor Green
}

# Arrêter les conteneurs existants
Write-Host "📦 Arrêt des conteneurs existants..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.prod.yml down
} catch {
    Write-Host "Aucun conteneur principal à arrêter" -ForegroundColor Gray
}

try {
    docker-compose -f docker-services/docker-compose.services.yml down
} catch {
    Write-Host "Aucun service externe à arrêter" -ForegroundColor Gray
}

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images obsolètes..." -ForegroundColor Yellow
docker system prune -f

# Reconstruire l'image avec --no-cache
Write-Host "🔨 Reconstruction de l'image..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services externes d'abord
Write-Host "🚀 Démarrage des services externes..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services externes..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Démarrer l'application principale
Write-Host "🚀 Démarrage de l'application principale..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Attendre que l'application soit prête
Write-Host "⏳ Attente du démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier la santé des services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Yellow
Write-Host ""
Write-Host "📊 Services principaux:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

Write-Host ""
Write-Host "📊 Services externes:" -ForegroundColor Cyan
docker-compose -f docker-services/docker-compose.services.yml ps

# Test de l'API de santé
Write-Host ""
Write-Host "🔍 Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    Write-Host "✅ API de santé accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ L'API de santé n'est pas accessible" -ForegroundColor Red
}

# Vérifier les logs
Write-Host ""
Write-Host "📋 Logs récents (application principale):" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs --tail=10

Write-Host ""
Write-Host "📋 Logs récents (services externes):" -ForegroundColor Cyan
docker-compose -f docker-services/docker-compose.services.yml logs --tail=10

Write-Host ""
Write-Host "✅ Déploiement terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services accessibles via Cloudflare Tunnel:" -ForegroundColor Cyan
Write-Host "   - Application principale: https://iahome.fr" -ForegroundColor White
Write-Host "   - LibreSpeed (avec Google SSO): https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "   - PDF Service: https://pdf.iahome.fr" -ForegroundColor White
Write-Host "   - MeTube: https://metube.iahome.fr" -ForegroundColor White
Write-Host "   - PsiTransfer: https://psitransfer.iahome.fr" -ForegroundColor White
Write-Host "   - QR Code: https://qrcode.iahome.fr" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Services locaux:" -ForegroundColor Cyan
Write-Host "   - Dashboard Traefik: http://localhost:8080" -ForegroundColor White
Write-Host "   - Application locale: http://localhost:3000" -ForegroundColor White
Write-Host ""
Write-Host "🔐 Sécurité:" -ForegroundColor Green
Write-Host "   - LibreSpeed protégé par Google SSO" -ForegroundColor White
Write-Host "   - Tunnel Cloudflare pour accès externe sécurisé" -ForegroundColor White
Write-Host "   - HTTPS avec certificats automatiques" -ForegroundColor White
Write-Host "   - Traefik comme reverse proxy" -ForegroundColor White
Write-Host ""
Write-Host "📝 Pour arrêter tous les services:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.prod.yml down" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-services/docker-compose.services.yml down" -ForegroundColor Gray
