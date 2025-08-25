#!/bin/bash

# Script de déploiement pour IAHome en production
echo "🚀 Déploiement IAHome en production..."

# Vérifier que Docker est démarré
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop."
    exit 1
fi

# Arrêter les conteneurs existants
echo "📦 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.prod.yml down

# Nettoyer les images obsolètes
echo "🧹 Nettoyage des images obsolètes..."
docker system prune -f

# Reconstruire l'image avec --no-cache
echo "🔨 Reconstruction de l'image..."
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.prod.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier la santé des services
echo "🏥 Vérification de la santé des services..."
docker-compose -f docker-compose.prod.yml ps

# Test de l'API de santé
echo "🔍 Test de l'API de santé..."
curl -f http://localhost:3000/api/health || echo "❌ L'API de santé n'est pas accessible"

# Vérifier les logs
echo "📋 Logs récents:"
docker-compose -f docker-compose.prod.yml logs --tail=20

echo "✅ Déploiement terminé !"
echo "🌐 Votre application est accessible sur: https://iahome.fr"
echo "📊 Dashboard Traefik: http://localhost:8080"
