#!/bin/bash

# Script Bash pour arrêter ConvertX et Gotenberg
echo "🛑 Arrêt de ConvertX et Gotenberg..."

# Aller dans le répertoire essentiels
cd "$(dirname "$0")"

# Arrêter les services
echo "📦 Arrêt des conteneurs..."
docker-compose -f docker-compose.convertx.yml down

if [ $? -eq 0 ]; then
    echo "✅ ConvertX et Gotenberg arrêtés avec succès !"
else
    echo "❌ Erreur lors de l'arrêt des services"
    exit 1
fi
