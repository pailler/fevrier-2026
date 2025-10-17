# Script de démarrage PowerShell pour Meeting Reports Generator
# Usage: .\start.ps1 [mode]
# Modes: dev, docker, install

param(
    [string]$Mode = "dev"
)

Write-Host "🎯 Meeting Reports Generator - Script de démarrage" -ForegroundColor Cyan
Write-Host "=" * 50 -ForegroundColor Cyan

function Test-Command {
    param([string]$Command)
    try {
        Get-Command $Command -ErrorAction Stop | Out-Null
        return $true
    }
    catch {
        return $false
    }
}

function Install-Dependencies {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    
    # Backend
    if (Test-Path "backend\requirements.txt") {
        Write-Host "Installing Python dependencies..." -ForegroundColor Green
        Set-Location backend
        pip install -r requirements.txt
        Set-Location ..
    }
    
    # Frontend
    if (Test-Path "frontend\package.json") {
        Write-Host "Installing Node.js dependencies..." -ForegroundColor Green
        Set-Location frontend
        npm install
        Set-Location ..
    }
    
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
}

function Start-Development {
    Write-Host "🚀 Démarrage en mode développement..." -ForegroundColor Yellow
    
    # Vérifier les prérequis
    if (-not (Test-Command "python")) {
        Write-Host "❌ Python n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Command "node")) {
        Write-Host "❌ Node.js n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    # Vérifier la clé API
    if (-not $env:OPENAI_API_KEY) {
        Write-Host "⚠️  OPENAI_API_KEY n'est pas définie" -ForegroundColor Yellow
        Write-Host "Définissez votre clé API OpenAI:" -ForegroundColor Yellow
        Write-Host '$env:OPENAI_API_KEY="votre_cle_api_ici"' -ForegroundColor Yellow
    }
    
    # Créer les répertoires
    New-Item -ItemType Directory -Force -Path "uploads" | Out-Null
    New-Item -ItemType Directory -Force -Path "reports" | Out-Null
    
    Write-Host "📁 Répertoires créés" -ForegroundColor Green
    
    # Démarrer le backend
    Write-Host "🔧 Démarrage du backend..." -ForegroundColor Green
    Start-Process -FilePath "python" -ArgumentList "start.py" -WorkingDirectory "backend" -WindowStyle Normal
    
    # Attendre un peu
    Start-Sleep -Seconds 3
    
    # Démarrer le frontend
    Write-Host "🎨 Démarrage du frontend..." -ForegroundColor Green
    Start-Process -FilePath "npm" -ArgumentList "start" -WorkingDirectory "frontend" -WindowStyle Normal
    
    Write-Host "✅ Application démarrée!" -ForegroundColor Green
    Write-Host "🌐 Interface web: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📡 API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📚 Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
}

function Start-Docker {
    Write-Host "🐳 Démarrage avec Docker..." -ForegroundColor Yellow
    
    if (-not (Test-Command "docker")) {
        Write-Host "❌ Docker n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    if (-not (Test-Command "docker-compose")) {
        Write-Host "❌ Docker Compose n'est pas installé" -ForegroundColor Red
        exit 1
    }
    
    # Vérifier le fichier .env
    if (-not (Test-Path ".env")) {
        Write-Host "⚠️  Fichier .env manquant, copie depuis env.example..." -ForegroundColor Yellow
        Copy-Item "backend\env.example" ".env"
        Write-Host "📝 Éditez le fichier .env avec votre clé API OpenAI" -ForegroundColor Yellow
    }
    
    # Démarrer les services
    Write-Host "🚀 Démarrage des services Docker..." -ForegroundColor Green
    docker-compose up -d
    
    Write-Host "✅ Services démarrés!" -ForegroundColor Green
    Write-Host "🌐 Interface web: http://localhost:3001" -ForegroundColor Cyan
    Write-Host "📡 API: http://localhost:8000" -ForegroundColor Cyan
    Write-Host "📚 Documentation: http://localhost:8000/docs" -ForegroundColor Cyan
    
    # Afficher les logs
    Write-Host "📋 Logs des services:" -ForegroundColor Yellow
    docker-compose logs -f
}

function Stop-Services {
    Write-Host "🛑 Arrêt des services..." -ForegroundColor Yellow
    
    # Arrêter Docker
    if (Test-Command "docker-compose") {
        docker-compose down
    }
    
    # Arrêter les processus Python/Node
    Get-Process | Where-Object {$_.ProcessName -eq "python" -or $_.ProcessName -eq "node"} | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Host "✅ Services arrêtés" -ForegroundColor Green
}

# Menu principal
switch ($Mode.ToLower()) {
    "install" {
        Install-Dependencies
    }
    "dev" {
        Start-Development
    }
    "docker" {
        Start-Docker
    }
    "stop" {
        Stop-Services
    }
    default {
        Write-Host "Usage: .\start.ps1 [mode]" -ForegroundColor Yellow
        Write-Host "Modes disponibles:" -ForegroundColor Yellow
        Write-Host "  install - Installer les dépendances" -ForegroundColor White
        Write-Host "  dev     - Démarrer en mode développement" -ForegroundColor White
        Write-Host "  docker  - Démarrer avec Docker" -ForegroundColor White
        Write-Host "  stop    - Arrêter tous les services" -ForegroundColor White
    }
}
