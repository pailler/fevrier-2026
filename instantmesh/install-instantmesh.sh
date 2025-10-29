#!/bin/bash
set -e

echo "🎨 Installation d'InstantMesh pour iahome.fr"
echo "=============================================="

# Vérifier Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé"
    exit 1
fi

echo "✅ Docker trouvé"

# Vérifier NVIDIA GPU
if ! docker info | grep -q nvidia; then
    echo "⚠️  NVIDIA Docker runtime non trouvé"
    echo "   Installation de nvidia-container-toolkit..."
    # Note: Nécessite sudo
    # sudo apt-get update && sudo apt-get install -y nvidia-container-toolkit
fi

echo "✅ Prêt pour la construction"

# Builder l'image
echo ""
echo "📦 Construction de l'image Docker..."
docker-compose -f docker-compose.instantmesh.yml build --no-cache

echo ""
echo "🎯 Démarrage du service..."
docker-compose -f docker-compose.instantmesh.yml up -d

echo ""
echo "✅ InstantMesh installé et démarré !"
echo "🌐 API disponible sur http://localhost:8003"
echo "📊 Health check : curl http://localhost:8003/health"
echo ""
echo "📝 Pour voir les logs : docker logs iahome-instantmesh"
echo "🛑 Pour arrêter : docker-compose -f docker-compose.instantmesh.yml down"
