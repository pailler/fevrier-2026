#!/bin/bash

# Script de déploiement sécurisé pour IAHome en production
# Avec Google SSO pour LibreSpeed et tunnel Cloudflare

echo "🚀 Déploiement IAHome en production sécurisé..."

# Vérifier que Docker est démarré
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Créer le réseau externe partagé
echo "🌐 Création du réseau Docker partagé..."
docker network create services-network 2>/dev/null || echo "✅ Réseau services-network existe déjà"

# Vérifier les variables d'environnement requises
echo "🔍 Vérification des variables d'environnement..."
if [ -z "$GOOGLE_CLIENT_ID" ] || [ -z "$GOOGLE_CLIENT_SECRET" ] || [ -z "$OAUTH2_PROXY_COOKIE_SECRET" ] || [ -z "$CLOUDFLARED_TUNNEL_TOKEN" ]; then
    echo "⚠️  Variables d'environnement manquantes:"
    echo "   - GOOGLE_CLIENT_ID"
    echo "   - GOOGLE_CLIENT_SECRET" 
    echo "   - OAUTH2_PROXY_COOKIE_SECRET"
    echo "   - CLOUDFLARED_TUNNEL_TOKEN"
    echo ""
    echo "📝 Instructions de configuration:"
    echo ""
    echo "1. Google OAuth (pour LibreSpeed):"
    echo "   - Allez sur https://console.developers.google.com/"
    echo "   - Créez un projet ou sélectionnez-en un"
    echo "   - Activez l'API Google+ et Google OAuth2"
    echo "   - Créez des identifiants OAuth 2.0"
    echo "   - URI de redirection: https://librespeed.regispailler.fr/oauth2/callback"
    echo "   - Ajoutez les valeurs dans env.production.local"
    echo ""
    echo "2. Cookie Secret (pour oauth2-proxy):"
    echo "   - Générez avec: openssl rand -base64 32"
    echo "   - Ajoutez dans env.production.local"
    echo ""
    echo "3. Cloudflare Tunnel:"
    echo "   - Installez cloudflared: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/"
    echo "   - Connectez-vous: cloudflared tunnel login"
    echo "   - Créez un tunnel: cloudflared tunnel create iahome"
    echo "   - Configurez le DNS: cloudflared tunnel route dns iahome librespeed.regispailler.fr"
    echo "   - Récupérez le token et ajoutez-le dans env.production.local"
    echo ""
    echo "4. Redémarrez le déploiement après configuration"
    exit 1
fi

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true
docker-compose -f docker-services/docker-compose.services.yml down 2>/dev/null || true

# Nettoyer les images obsolètes
echo "🧹 Nettoyage des images obsolètes..."
docker system prune -f

# Reconstruire l'image avec --no-cache
echo "🔨 Reconstruction de l'image..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services externes d'abord
echo "🚀 Démarrage des services externes..."
docker-compose -f docker-services/docker-compose.services.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services externes..."
sleep 30

# Démarrer l'application principale
echo "🚀 Démarrage de l'application principale..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que l'application soit prête
echo "⏳ Attente du démarrage de l'application..."
sleep 30

# Vérifier la santé des services
echo "🏥 Vérification de la santé des services..."
echo ""
echo "📊 Services principaux:"
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "📊 Services externes:"
docker-compose -f docker-services/docker-compose.services.yml ps

# Test de l'API de santé
echo ""
echo "🔍 Test de l'API de santé..."
curl -f http://localhost:3000/api/health || echo "❌ L'API de santé n'est pas accessible"

# Vérifier les logs
echo ""
echo "📋 Logs récents (application principale):"
docker-compose -f docker-compose.prod.yml logs --tail=10

echo ""
echo "📋 Logs récents (services externes):"
docker-compose -f docker-services/docker-compose.services.yml logs --tail=10

echo ""
echo "✅ Déploiement terminé !"
echo ""
echo "🌐 Services accessibles:"
echo "   - Application principale: https://iahome.fr"
echo "   - LibreSpeed (avec Google SSO): https://librespeed.regispailler.fr"
echo "   - PDF Service: https://pdf.regispailler.fr"
echo "   - MeTube: https://metube.regispailler.fr"
echo "   - PsiTransfer: https://psitransfer.regispailler.fr"
echo "   - DragGAN: https://draggan.regispailler.fr"
echo "   - QR Code: https://qrcode.regispailler.fr"
echo ""
echo "📊 Dashboard Traefik: http://localhost:8080"
echo ""
echo "🔐 LibreSpeed est maintenant protégé par Google SSO"
echo "🌐 Le tunnel Cloudflare est configuré pour l'accès externe"
echo ""
echo "📝 Pour arrêter tous les services:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo "   docker-compose -f docker-services/docker-compose.services.yml down"
