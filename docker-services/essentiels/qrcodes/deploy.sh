#!/bin/bash

# 🚀 Script de Déploiement Automatique - QR Code Generator IAHome
# Version: 4.0.0

set -e  # Arrêter en cas d'erreur

echo "🚀 Déploiement QR Code Generator IAHome v4.0.0"
echo "================================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier que Docker est installé
check_docker() {
    log_info "Vérification de Docker..."
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    log_success "Docker et Docker Compose sont installés"
}

# Vérifier les variables d'environnement
check_env() {
    log_info "Vérification des variables d'environnement..."
    
    if [ ! -f .env ]; then
        log_warning "Fichier .env non trouvé. Création d'un fichier .env par défaut..."
        cat > .env << EOF
# Configuration QR Code Generator IAHome
DATABASE_URL=postgresql://qrcode_user:qrcode_password@postgres:5432/qrcode_db
IAHOME_JWT_SECRET=qr-code-secret-key-change-in-production
IAHOME_API_URL=https://iahome.fr
FLASK_ENV=production
EOF
        log_warning "⚠️  IMPORTANT: Modifiez le fichier .env avec vos vraies valeurs avant la production !"
    fi
    
    log_success "Variables d'environnement configurées"
}

# Arrêter les services existants
stop_services() {
    log_info "Arrêt des services existants..."
    docker-compose down --remove-orphans || true
    log_success "Services arrêtés"
}

# Pull des dernières modifications
pull_changes() {
    log_info "Récupération des dernières modifications..."
    if [ -d .git ]; then
        git pull origin main || log_warning "Impossible de récupérer les modifications Git"
    else
        log_warning "Pas de repository Git détecté"
    fi
}

# Build et démarrage des services
build_and_start() {
    log_info "Build et démarrage des services..."
    docker-compose up -d --build
    
    log_info "Attente du démarrage des services..."
    sleep 15
}

# Vérification de la santé des services
health_check() {
    log_info "Vérification de la santé des services..."
    
    # Attendre que les services soient prêts
    local max_attempts=30
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        if curl -f http://localhost:7005/health > /dev/null 2>&1; then
            log_success "Service QR Code Generator opérationnel"
            break
        fi
        
        log_info "Tentative $attempt/$max_attempts - Attente..."
        sleep 5
        attempt=$((attempt + 1))
    done
    
    if [ $attempt -gt $max_attempts ]; then
        log_error "Le service n'a pas démarré correctement"
        docker-compose logs qr-code-service
        exit 1
    fi
}

# Test de l'API
test_api() {
    log_info "Test de l'API..."
    
    # Test du health check
    if curl -f http://localhost:7005/health > /dev/null 2>&1; then
        log_success "Health check OK"
    else
        log_error "Health check échoué"
        return 1
    fi
    
    # Test de l'authentification
    if curl -s http://localhost:7005/ | grep -q "Authentification requise"; then
        log_success "Authentification configurée correctement"
    else
        log_warning "Authentification non détectée"
    fi
}

# Affichage des informations de déploiement
show_info() {
    echo ""
    echo "🎉 Déploiement terminé avec succès !"
    echo "====================================="
    echo ""
    echo "📊 Informations du service :"
    echo "   • URL locale : http://localhost:7005"
    echo "   • Health check : http://localhost:7005/health"
    echo "   • API : http://localhost:7005/api"
    echo ""
    echo "🔧 Commandes utiles :"
    echo "   • Voir les logs : docker-compose logs -f qr-code-service"
    echo "   • Arrêter : docker-compose down"
    echo "   • Redémarrer : docker-compose restart"
    echo ""
    echo "🌐 Pour l'accès externe :"
    echo "   • Configurez un reverse proxy (Nginx)"
    echo "   • Ajoutez un certificat SSL"
    echo "   • Mettez à jour l'URL dans IAHome"
    echo ""
    echo "📚 Documentation :"
    echo "   • Guide de déploiement : DEPLOYMENT.md"
    echo "   • Intégration IAHome : INTEGRATION_IAHOME.md"
    echo ""
}

# Fonction principale
main() {
    echo "Début du déploiement à $(date)"
    echo ""
    
    check_docker
    check_env
    stop_services
    pull_changes
    build_and_start
    health_check
    test_api
    show_info
    
    echo "Déploiement terminé à $(date)"
}

# Exécution du script
main "$@"
