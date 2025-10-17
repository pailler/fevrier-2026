#!/bin/bash
# Script de démarrage Bash pour Meeting Reports Generator
# Usage: ./start.sh [mode]
# Modes: dev, docker, install

MODE=${1:-"dev"}

echo "🎯 Meeting Reports Generator - Script de démarrage"
echo "=================================================="

check_command() {
    if command -v "$1" &> /dev/null; then
        return 0
    else
        return 1
    fi
}

install_dependencies() {
    echo "📦 Installation des dépendances..."
    
    # Backend
    if [ -f "backend/requirements.txt" ]; then
        echo "Installing Python dependencies..."
        cd backend
        pip install -r requirements.txt
        cd ..
    fi
    
    # Frontend
    if [ -f "frontend/package.json" ]; then
        echo "Installing Node.js dependencies..."
        cd frontend
        npm install
        cd ..
    fi
    
    echo "✅ Dépendances installées"
}

start_development() {
    echo "🚀 Démarrage en mode développement..."
    
    # Vérifier les prérequis
    if ! check_command "python3"; then
        echo "❌ Python3 n'est pas installé"
        exit 1
    fi
    
    if ! check_command "node"; then
        echo "❌ Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier la clé API
    if [ -z "$OPENAI_API_KEY" ]; then
        echo "⚠️  OPENAI_API_KEY n'est pas définie"
        echo "Définissez votre clé API OpenAI:"
        echo "export OPENAI_API_KEY='votre_cle_api_ici'"
    fi
    
    # Créer les répertoires
    mkdir -p uploads reports
    
    echo "📁 Répertoires créés"
    
    # Démarrer le backend
    echo "🔧 Démarrage du backend..."
    cd backend
    python3 start.py &
    BACKEND_PID=$!
    cd ..
    
    # Attendre un peu
    sleep 3
    
    # Démarrer le frontend
    echo "🎨 Démarrage du frontend..."
    cd frontend
    npm start &
    FRONTEND_PID=$!
    cd ..
    
    echo "✅ Application démarrée!"
    echo "🌐 Interface web: http://localhost:3001"
    echo "📡 API: http://localhost:8000"
    echo "📚 Documentation: http://localhost:8000/docs"
    
    # Fonction de nettoyage
    cleanup() {
        echo "🛑 Arrêt des services..."
        kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
        exit 0
    }
    
    # Capturer Ctrl+C
    trap cleanup SIGINT
    
    # Attendre
    wait
}

start_docker() {
    echo "🐳 Démarrage avec Docker..."
    
    if ! check_command "docker"; then
        echo "❌ Docker n'est pas installé"
        exit 1
    fi
    
    if ! check_command "docker-compose"; then
        echo "❌ Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérifier le fichier .env
    if [ ! -f ".env" ]; then
        echo "⚠️  Fichier .env manquant, copie depuis env.example..."
        cp backend/env.example .env
        echo "📝 Éditez le fichier .env avec votre clé API OpenAI"
    fi
    
    # Démarrer les services
    echo "🚀 Démarrage des services Docker..."
    docker-compose up -d
    
    echo "✅ Services démarrés!"
    echo "🌐 Interface web: http://localhost:3001"
    echo "📡 API: http://localhost:8000"
    echo "📚 Documentation: http://localhost:8000/docs"
    
    # Afficher les logs
    echo "📋 Logs des services:"
    docker-compose logs -f
}

stop_services() {
    echo "🛑 Arrêt des services..."
    
    # Arrêter Docker
    if check_command "docker-compose"; then
        docker-compose down
    fi
    
    # Arrêter les processus Python/Node
    pkill -f "python.*start.py" 2>/dev/null
    pkill -f "npm.*start" 2>/dev/null
    
    echo "✅ Services arrêtés"
}

# Menu principal
case $MODE in
    "install")
        install_dependencies
        ;;
    "dev")
        start_development
        ;;
    "docker")
        start_docker
        ;;
    "stop")
        stop_services
        ;;
    *)
        echo "Usage: ./start.sh [mode]"
        echo "Modes disponibles:"
        echo "  install - Installer les dépendances"
        echo "  dev     - Démarrer en mode développement"
        echo "  docker  - Démarrer avec Docker"
        echo "  stop    - Arrêter tous les services"
        ;;
esac
