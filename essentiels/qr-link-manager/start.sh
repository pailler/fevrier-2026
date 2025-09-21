#!/bin/bash

# QR Link Manager - Script de démarrage
echo "🚀 Démarrage de QR Link Manager..."

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Vérifier si le fichier .env existe
if [ ! -f .env ]; then
    echo "📝 Création du fichier .env..."
    cp env.example .env
    echo "⚠️  Veuillez configurer le fichier .env avant de continuer."
    echo "   Vous pouvez éditer le fichier .env avec vos paramètres."
    read -p "Appuyez sur Entrée pour continuer..."
fi

# Construire et démarrer les services
echo "🔨 Construction des images Docker..."
docker-compose build

echo "🚀 Démarrage des services..."
docker-compose up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 10

# Vérifier l'état des services
echo "📊 État des services:"
docker-compose ps

# Afficher les URLs d'accès
echo ""
echo "✅ QR Link Manager est maintenant démarré!"
echo ""
echo "🌐 URLs d'accès:"
echo "   Frontend: http://localhost:7000"
echo "   API: http://localhost:7001"
echo "   Redirection: http://localhost:7002"
echo "   Santé API: http://localhost:7001/health"
echo ""
echo "📝 Compte par défaut:"
echo "   Email: admin@qrlink.com"
echo "   Mot de passe: admin123"
echo ""
echo "📋 Commandes utiles:"
echo "   Voir les logs: docker-compose logs -f"
echo "   Arrêter: docker-compose down"
echo "   Redémarrer: docker-compose restart"
echo ""
