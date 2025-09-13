#!/bin/bash

# Script Bash pour démarrer ConvertX et Gotenberg
echo "🚀 Démarrage de ConvertX et Gotenberg..."

# Vérifier si Docker est en cours d'exécution
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez le démarrer d'abord."
    exit 1
fi

# Aller dans le répertoire docker-services
cd "$(dirname "$0")"

# Démarrer les services
echo "📦 Démarrage des conteneurs..."
docker-compose -f docker-compose.convertx.yml up -d

if [ $? -eq 0 ]; then
    echo "✅ ConvertX et Gotenberg démarrés avec succès !"
    echo ""
    echo "🌐 Services disponibles :"
    echo "   - ConvertX: http://localhost:9080"
    echo "   - Gotenberg: http://localhost:9081"
    echo ""
    echo "📊 Statut des conteneurs :"
    docker-compose -f docker-compose.convertx.yml ps
else
    echo "❌ Erreur lors du démarrage des services"
    exit 1
fi
