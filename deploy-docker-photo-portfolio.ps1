# Script de déploiement Docker pour Portfolio Photo IA (PowerShell)
# Usage: .\deploy-docker-photo-portfolio.ps1 [start|stop|restart|logs|status]

param(
    [Parameter(Position=0)]
    [ValidateSet("start", "stop", "restart", "logs", "status", "cleanup", "help")]
    [string]$Command = "start"
)

# Configuration
$ComposeFile = "docker-compose.photo-portfolio.yml"
$ServiceName = "photo-portfolio"
$ContainerName = "iahome-photo-portfolio"

# Fonctions utilitaires
function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Blue
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Vérifier si Docker est installé
function Test-Docker {
    Write-Info "Vérification de Docker..."
    
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Error "Docker n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    }
    
    if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
        Write-Error "Docker Compose n'est pas installé. Veuillez l'installer d'abord."
        exit 1
    }
    
    Write-Success "Docker et Docker Compose sont installés"
}

# Vérifier les variables d'environnement
function Test-Environment {
    Write-Info "Vérification des variables d'environnement..."
    
    if (-not (Test-Path ".env.local")) {
        Write-Warning "Fichier .env.local non trouvé. Copie du fichier d'exemple..."
        Copy-Item "env.docker.example" ".env.local"
        Write-Warning "Veuillez configurer les variables dans .env.local avant de continuer."
        exit 1
    }
    
    # Charger les variables d'environnement
    Get-Content ".env.local" | ForEach-Object {
        if ($_ -match "^([^#][^=]+)=(.*)$") {
            [Environment]::SetEnvironmentVariable($matches[1], $matches[2], "Process")
        }
    }
    
    # Vérifier les variables essentielles
    if (-not $env:NEXT_PUBLIC_SUPABASE_URL) {
        Write-Error "NEXT_PUBLIC_SUPABASE_URL n'est pas définie dans .env.local"
        exit 1
    }
    
    if (-not $env:OPENAI_API_KEY) {
        Write-Error "OPENAI_API_KEY n'est pas définie dans .env.local"
        exit 1
    }
    
    Write-Success "Variables d'environnement vérifiées"
}

# Créer le réseau Docker s'il n'existe pas
function New-DockerNetwork {
    Write-Info "Création du réseau Docker..."
    
    $networkExists = docker network ls --format "{{.Name}}" | Select-String "iahome-network"
    
    if (-not $networkExists) {
        docker network create iahome-network
        Write-Success "Réseau iahome-network créé"
    } else {
        Write-Info "Réseau iahome-network existe déjà"
    }
}

# Démarrer les services
function Start-Services {
    Write-Info "Démarrage des services Docker..."
    
    # Arrêter les services existants
    try {
        docker-compose -f $ComposeFile down 2>$null
    } catch {
        # Ignorer les erreurs si les services ne sont pas démarrés
    }
    
    # Construire et démarrer
    docker-compose -f $ComposeFile up --build -d
    
    Write-Success "Services démarrés avec succès"
    Write-Info "Portfolio Photo IA accessible sur: http://localhost:3001"
    Write-Info "Nginx accessible sur: http://localhost:80"
}

# Arrêter les services
function Stop-Services {
    Write-Info "Arrêt des services Docker..."
    docker-compose -f $ComposeFile down
    Write-Success "Services arrêtés"
}

# Redémarrer les services
function Restart-Services {
    Write-Info "Redémarrage des services Docker..."
    Stop-Services
    Start-Services
}

# Afficher les logs
function Show-Logs {
    Write-Info "Affichage des logs des services..."
    docker-compose -f $ComposeFile logs -f
}

# Afficher le statut
function Show-Status {
    Write-Info "Statut des services Docker:"
    docker-compose -f $ComposeFile ps
    
    Write-Host ""
    Write-Info "Utilisation des ressources:"
    docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}\t{{.BlockIO}}"
}

# Nettoyer les ressources
function Clear-Resources {
    Write-Info "Nettoyage des ressources Docker..."
    
    # Arrêter et supprimer les conteneurs
    docker-compose -f $ComposeFile down -v
    
    # Supprimer les images non utilisées
    docker image prune -f
    
    # Supprimer les volumes non utilisés
    docker volume prune -f
    
    Write-Success "Nettoyage terminé"
}

# Afficher l'aide
function Show-Help {
    Write-Host "Usage: .\deploy-docker-photo-portfolio.ps1 [COMMAND]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  start     Démarrer les services (défaut)"
    Write-Host "  stop      Arrêter les services"
    Write-Host "  restart   Redémarrer les services"
    Write-Host "  logs      Afficher les logs"
    Write-Host "  status    Afficher le statut"
    Write-Host "  cleanup   Nettoyer les ressources"
    Write-Host "  help      Afficher cette aide"
}

# Fonction principale
function Main {
    switch ($Command) {
        "start" {
            Test-Docker
            Test-Environment
            New-DockerNetwork
            Start-Services
        }
        "stop" {
            Test-Docker
            Stop-Services
        }
        "restart" {
            Test-Docker
            Test-Environment
            Restart-Services
        }
        "logs" {
            Test-Docker
            Show-Logs
        }
        "status" {
            Test-Docker
            Show-Status
        }
        "cleanup" {
            Test-Docker
            Clear-Resources
        }
        "help" {
            Show-Help
        }
        default {
            Write-Error "Commande inconnue: $Command"
            Show-Help
            exit 1
        }
    }
}

# Exécuter la fonction principale
Main
