#!/bin/bash

# Script de déploiement Docker pour Portfolio Photo IA
# Usage: ./deploy-docker-photo-portfolio.sh [start|stop|restart|logs|status]

set -e

# Configuration
COMPOSE_FILE="docker-compose.photo-portfolio.yml"
SERVICE_NAME="photo-portfolio"
CONTAINER_NAME="iahome-photo-portfolio"

# Couleurs pour les logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si Docker est installé
check_docker() {
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    fi
}

# Vérifier les variables d'environnement
check_env() {
    log_info "Vérification des variables d'environnement..."
    
    if [ ! -f ".env.local" ]; then
        log_warning "Fichier .env.local non trouvé. Copie du fichier d'exemple..."
        cp env.docker.example .env.local
        log_warning "Veuillez configurer les variables dans .env.local avant de continuer."
        exit 1
    fi
    
    # Vérifier les variables essentielles
    source .env.local
    
    if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
        log_error "NEXT_PUBLIC_SUPABASE_URL n'est pas définie dans .env.local"
        exit 1
    fi
    
    if [ -z "$OPENAI_API_KEY" ]; then
        log_error "OPENAI_API_KEY n'est pas définie dans .env.local"
        exit 1
    fi
    
    log_success "Variables d'environnement vérifiées"
}

# Créer le réseau Docker s'il n'existe pas
create_network() {
    log_info "Création du réseau Docker..."
    if ! docker network ls | grep -q "iahome-network"; then
        docker network create iahome-network
        log_success "Réseau iahome-network créé"
    else
        log_info "Réseau iahome-network existe déjà"
    fi
}

# Démarrer les services
start_services() {
    log_info "Démarrage des services Docker..."
    
    # Arrêter les services existants
    docker-compose -f $COMPOSE_FILE down 2>/dev/null || true
    
    # Construire et démarrer
    docker-compose -f $COMPOSE_FILE up --build -d
    
    log_success "Services démarrés avec succès"
    log_info "Portfolio Photo IA accessible sur: http://localhost:3001"
    log_info "Nginx accessible sur: http://localhost:80"
}

# Arrêter les services
stop_services() {
    log_info "Arrêt des services Docker..."
    docker-compose -f $COMPOSE_FILE down
    log_success "Services arrêtés"
}

# Redémarrer les services
restart_services() {
    log_info "Redémarrage des services Docker..."
    stop_services
    start_services
}

# Afficher les logs
show_logs() {
    log_info "Affichage des logs des services..."
    docker-compose -f $COMPOSE_FILE logs -f
}

# Afficher le statut
show_status() {
    log_info "Statut des services Docker:"
    docker-compose -f $COMPOSE_FILE ps
    
    echo ""
    log_info "Utilisation des ressources:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Nettoyer les ressources
cleanup() {
    log_info "Nettoyage des ressources Docker..."
    
    # Arrêter et supprimer les conteneurs
    docker-compose -f $COMPOSE_FILE down -v
    
    # Supprimer les images non utilisées
    docker image prune -f
    
    # Supprimer les volumes non utilisés
    docker volume prune -f
    
    log_success "Nettoyage terminé"
}

# Fonction principale
main() {
    case "${1:-start}" in
        "start")
            check_docker
            check_env
            create_network
            start_services
            ;;
        "stop")
            check_docker
            stop_services
            ;;
        "restart")
            check_docker
            check_env
            restart_services
            ;;
        "logs")
            check_docker
            show_logs
            ;;
        "status")
            check_docker
            show_status
            ;;
        "cleanup")
            check_docker
            cleanup
            ;;
        "help"|"-h"|"--help")
            echo "Usage: $0 [COMMAND]"
            echo ""
            echo "Commands:"
            echo "  start     Démarrer les services (défaut)"
            echo "  stop      Arrêter les services"
            echo "  restart   Redémarrer les services"
            echo "  logs      Afficher les logs"
            echo "  status    Afficher le statut"
            echo "  cleanup   Nettoyer les ressources"
            echo "  help      Afficher cette aide"
            ;;
        *)
            log_error "Commande inconnue: $1"
            echo "Utilisez '$0 help' pour voir les commandes disponibles."
            exit 1
            ;;
    esac
}

# Exécuter la fonction principale
main "$@"
