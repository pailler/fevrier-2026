#!/bin/bash

# Script de déploiement de l'application de recherche immobilière
# Sur le NAS 192.168.1.130 avec le sous-domaine immo.regispailler.fr

set -e

echo "🏠 Déploiement de l'application de recherche immobilière..."

# Configuration
NAS_IP="192.168.1.130"
NAS_USER="${NAS_USER:-admin}"
NAS_PATH="${NAS_PATH:-/volume1/docker/iahome}"
SUBDOMAIN="immo.regispailler.fr"
CONTAINER_NAME="real-estate-app"

# Vérifier la connexion au NAS
echo "📡 Vérification de la connexion au NAS..."
if ! ping -c 1 -W 2 $NAS_IP > /dev/null 2>&1; then
    echo "❌ Erreur: Impossible de joindre le NAS à $NAS_IP"
    exit 1
fi

# Créer le répertoire sur le NAS si nécessaire
echo "📁 Création des répertoires sur le NAS..."
ssh $NAS_USER@$NAS_IP "mkdir -p $NAS_PATH/traefik/dynamic"

# Copier les fichiers de configuration
echo "📋 Copie des fichiers de configuration..."
scp docker-compose.real-estate.yml $NAS_USER@$NAS_IP:$NAS_PATH/
scp traefik/dynamic/real-estate.yml $NAS_USER@$NAS_IP:$NAS_PATH/traefik/dynamic/
# Copier le Dockerfile dans immo
scp Dockerfile $NAS_USER@$NAS_IP:$NAS_PATH/immo/

# Copier les fichiers nécessaires pour le build
echo "📦 Copie des fichiers de l'application..."
# Créer le répertoire immo sur le NAS
ssh $NAS_USER@$NAS_IP "mkdir -p $NAS_PATH/immo"

# Copier les fichiers essentiels
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' \
    --exclude '*.log' --exclude '.env.local' --exclude 'logs' \
    --exclude 'hunyuan2-spz' --exclude 'meeting-reports' \
    --exclude 'apprendre-autrement' --exclude 'prompt-generator' \
    --exclude 'prompts' --exclude 'deploy' \
    ./ $NAS_USER@$NAS_IP:$NAS_PATH/immo/

# Construire et démarrer le container
echo "🔨 Construction et démarrage du container..."
ssh $NAS_USER@$NAS_IP << EOF
cd $NAS_PATH
docker-compose -f docker-compose.real-estate.yml down || true
docker-compose -f docker-compose.real-estate.yml build --no-cache
docker-compose -f docker-compose.real-estate.yml up -d

# Vérifier que le container est démarré
sleep 5
docker ps | grep $CONTAINER_NAME || echo "⚠️  Container non trouvé"
EOF

echo "✅ Déploiement terminé!"
echo "🌐 Application disponible sur: https://$SUBDOMAIN"
echo ""
echo "📊 Vérifier les logs:"
echo "   ssh $NAS_USER@$NAS_IP 'cd $NAS_PATH && docker-compose -f docker-compose.real-estate.yml logs -f'"
