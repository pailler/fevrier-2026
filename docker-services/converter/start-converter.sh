#!/bin/bash
# Script de démarrage pour le service Converter (Linux/macOS)
# Usage: ./start-converter.sh

echo "🚀 Démarrage du service Converter..."

# Vérifier si Docker est en cours d'exécution
if ! docker version > /dev/null 2>&1; then
    echo "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker."
    exit 1
fi

# Se déplacer dans le dossier converter
cd "$(dirname "$0")"

# Démarrer les services
echo "📦 Construction et démarrage des conteneurs..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo "✅ Service Converter démarré avec succès!"
    echo "🌐 Service accessible sur: http://localhost:8096"
    echo "🌐 Service accessible sur: https://converter.iahome.fr"
    
    # Afficher le statut des conteneurs
    echo ""
    echo "📊 Statut des conteneurs:"
    docker-compose ps
else
    echo "❌ Erreur lors du démarrage du service Converter."
    exit 1
fi
