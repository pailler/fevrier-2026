#!/bin/bash

# Script de déploiement Docker pour Photo Portfolio IA
echo "🚀 Déploiement Docker - Photo Portfolio IA iAhome"
echo "=================================================="

# Vérifier que Docker est installé
if ! command -v docker &> /dev/null; then
    echo "❌ Docker n'est pas installé. Veuillez installer Docker d'abord."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord."
    exit 1
fi

# Vérifier les fichiers de configuration
echo "📋 Vérification des fichiers de configuration..."

if [ ! -f "Dockerfile.photo-portfolio" ]; then
    echo "❌ Dockerfile.photo-portfolio manquant"
    exit 1
fi

if [ ! -f "docker-compose.photo-portfolio.yml" ]; then
    echo "❌ docker-compose.photo-portfolio.yml manquant"
    exit 1
fi

if [ ! -f "nginx/photo-portfolio.conf" ]; then
    echo "❌ nginx/photo-portfolio.conf manquant"
    exit 1
fi

if [ ! -f ".env.local" ]; then
    echo "⚠️  Fichier .env.local manquant. Création d'un exemple..."
    cat > .env.local << EOF
# Configuration Photo Portfolio IA
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
SUPABASE_STORAGE_BUCKET=photo-portfolio
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
EOF
    echo "📝 Veuillez configurer le fichier .env.local avec vos clés API"
fi

echo "✅ Fichiers de configuration trouvés"

# Arrêter les conteneurs existants
echo "🛑 Arrêt des conteneurs existants..."
docker-compose -f docker-compose.photo-portfolio.yml down

# Nettoyer les images non utilisées
echo "🧹 Nettoyage des images Docker..."
docker image prune -f

# Construire les images
echo "🔨 Construction des images Docker..."
docker-compose -f docker-compose.photo-portfolio.yml build --no-cache

# Démarrer les services
echo "🚀 Démarrage des services..."
docker-compose -f docker-compose.photo-portfolio.yml up -d

# Attendre que les services soient prêts
echo "⏳ Attente du démarrage des services..."
sleep 30

# Vérifier le statut des services
echo "📊 Vérification du statut des services..."
docker-compose -f docker-compose.photo-portfolio.yml ps

# Vérifier la santé des services
echo "🏥 Vérification de la santé des services..."
echo "Application Photo Portfolio:"
curl -f http://localhost:3001/health || echo "❌ Application non accessible"

echo "Redis:"
docker exec photo-portfolio-redis redis-cli ping || echo "❌ Redis non accessible"

echo "Nginx:"
curl -f http://localhost/health || echo "❌ Nginx non accessible"

# Afficher les logs
echo "📋 Logs des services:"
echo "===================="
docker-compose -f docker-compose.photo-portfolio.yml logs --tail=20

echo ""
echo "🎉 Déploiement terminé !"
echo "========================"
echo "📱 Application Photo Portfolio: http://localhost:3001"
echo "🌐 Application via Nginx: http://localhost"
echo "📊 Redis: localhost:6379"
echo ""
echo "📋 Commandes utiles:"
echo "  Voir les logs: docker-compose -f docker-compose.photo-portfolio.yml logs -f"
echo "  Arrêter: docker-compose -f docker-compose.photo-portfolio.yml down"
echo "  Redémarrer: docker-compose -f docker-compose.photo-portfolio.yml restart"
echo "  Statut: docker-compose -f docker-compose.photo-portfolio.yml ps"





