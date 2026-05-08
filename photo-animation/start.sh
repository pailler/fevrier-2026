#!/bin/bash

# Script bash pour démarrer l'application localement

echo "🎬 Démarrage de l'application d'animation de photos..."

# Vérifier si Python est installé
if ! command -v python3 &> /dev/null; then
    echo "❌ Python n'est pas installé. Veuillez installer Python 3.8 ou supérieur."
    exit 1
fi

# Vérifier la version de Python
PYTHON_VERSION=$(python3 --version)
echo "✅ Python détecté: $PYTHON_VERSION"

# Vérifier si les dépendances sont installées
echo "📦 Vérification des dépendances..."
if ! python3 -c "import gradio" 2>/dev/null; then
    echo "⚠️  Installation des dépendances..."
    pip3 install -r requirements.txt
fi

# Démarrer l'application
echo "🚀 Lancement de l'application..."
export PHOTOBOOTH_PORT="${PHOTOBOOTH_PORT:-7887}"
echo "📍 L'application sera accessible sur http://localhost:${PHOTOBOOTH_PORT}"
echo ""

python3 app.py
