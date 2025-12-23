#!/bin/bash

# Script bash pour démarrer apprendre-autrement avec Docker

echo "🚀 Démarrage de apprendre-autrement..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker."
    exit 1
fi

# Construire et démarrer les conteneurs
echo "📦 Construction et démarrage des conteneurs..."
docker-compose up -d --build

if [ $? -eq 0 ]; then
    echo "✅ Application démarrée avec succès !"
    echo "🌐 Accédez à l'application sur http://localhost:9001"
    echo ""
    echo "Pour voir les logs : docker-compose logs -f"
    echo "Pour arrêter : docker-compose down"
else
    echo "❌ Erreur lors du démarrage"
    exit 1
fi





