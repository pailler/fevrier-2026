# Script de déploiement sécurisé pour IAHome en production
# Avec Google SSO pour LibreSpeed et tunnel Cloudflare

Write-Host "🚀 Déploiement IAHome en production sécurisé..." -ForegroundColor Green

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

# Vérifier les variables d'environnement requises
Write-Host "🔍 Vérification des variables d'environnement..." -ForegroundColor Yellow

$envFile = "env.production.local"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    
    if ($envContent -notmatch "GOOGLE_CLIENT_ID=" -or 
        $envContent -notmatch "GOOGLE_CLIENT_SECRET=" -or 
        $envContent -notmatch "OAUTH2_PROXY_COOKIE_SECRET=" -or 
        $envContent -notmatch "CLOUDFLARED_TUNNEL_TOKEN=") {
        
        Write-Host "⚠️  Variables d'environnement manquantes dans $envFile" -ForegroundColor Yellow
        Write-Host ""
        Write-Host "📝 Instructions de configuration:" -ForegroundColor Cyan
        Write-Host ""
        Write-Host "1. Google OAuth (pour LibreSpeed):" -ForegroundColor White
        Write-Host "   - Allez sur https://console.developers.google.com/" -ForegroundColor Gray
        Write-Host "   - Créez un projet ou sélectionnez-en un" -ForegroundColor Gray
        Write-Host "   - Activez l'API Google+ et Google OAuth2" -ForegroundColor Gray
        Write-Host "   - Créez des identifiants OAuth 2.0" -ForegroundColor Gray
        Write-Host "   - URI de redirection: https://librespeed.regispailler.fr/oauth2/callback" -ForegroundColor Gray
        Write-Host "   - Ajoutez les valeurs dans $envFile" -ForegroundColor Gray
        Write-Host ""
        Write-Host "2. Cookie Secret (pour oauth2-proxy):" -ForegroundColor White
        Write-Host "   - Générez avec: openssl rand -base64 32" -ForegroundColor Gray
        Write-Host "   - Ou utilisez: [System.Web.Security.Membership]::GeneratePassword(32, 0)" -ForegroundColor Gray
        Write-Host "   - Ajoutez dans $envFile" -ForegroundColor Gray
        Write-Host ""
        Write-Host "3. Cloudflare Tunnel:" -ForegroundColor White
        Write-Host "   - Installez cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Gray
        Write-Host "   - Connectez-vous: cloudflared tunnel login" -ForegroundColor Gray
        Write-Host "   - Créez un tunnel: cloudflared tunnel create iahome" -ForegroundColor Gray
        Write-Host "   - Configurez le DNS: cloudflared tunnel route dns iahome librespeed.regispailler.fr" -ForegroundColor Gray
        Write-Host "   - Récupérez le token et ajoutez-le dans $envFile" -ForegroundColor Gray
        Write-Host ""
        Write-Host "4. Redémarrez le déploiement après configuration" -ForegroundColor White
        exit 1
    }
} else {
    Write-Host "❌ Fichier $envFile non trouvé" -ForegroundColor Red
    exit 1
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
Write-Host "🌐 Services accessibles:" -ForegroundColor Cyan
Write-Host "   - Application principale: https://iahome.fr" -ForegroundColor White
Write-Host "   - LibreSpeed (avec Google SSO): https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   - PDF Service: https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   - MeTube: https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   - PsiTransfer: https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   - DragGAN: https://draggan.regispailler.fr" -ForegroundColor White
Write-Host "   - QR Code: https://qrcode.regispailler.fr" -ForegroundColor White
Write-Host ""
Write-Host "📊 Dashboard Traefik: http://localhost:8080" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔐 LibreSpeed est maintenant protégé par Google SSO" -ForegroundColor Green
Write-Host "🌐 Le tunnel Cloudflare est configuré pour l'accès externe" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Pour arrêter tous les services:" -ForegroundColor Yellow
Write-Host "   docker-compose -f docker-compose.prod.yml down" -ForegroundColor Gray
Write-Host "   docker-compose -f docker-services/docker-compose.services.yml down" -ForegroundColor Gray
