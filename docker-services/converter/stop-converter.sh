#!/bin/bash
# Script d'arrêt pour le service Converter (Linux/macOS)
# Usage: ./stop-converter.sh

echo "🛑 Arrêt du service Converter..."

# Se déplacer dans le dossier converter
cd "$(dirname "$0")"

# Arrêter les services
echo "📦 Arrêt des conteneurs..."
docker-compose down

if [ $? -eq 0 ]; then
    echo "✅ Service Converter arrêté avec succès!"
    
    # Optionnel: Nettoyer les images non utilisées
    read -p "Voulez-vous nettoyer les images non utilisées? (y/N): " cleanup
    if [[ $cleanup =~ ^[Yy]$ ]]; then
        echo "🧹 Nettoyage des images non utilisées..."
        docker image prune -f
    fi
else
    echo "❌ Erreur lors de l'arrêt du service Converter."
    exit 1
fi
