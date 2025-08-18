# Script de déploiement en production pour IAHOME.FR
Write-Host "🚀 Déploiement de l'application IAHOME en production..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet" -ForegroundColor Red
    exit 1
}

# Vérifier que le fichier de configuration de production existe
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ Erreur: Le fichier .env.production n'existe pas" -ForegroundColor Red
    Write-Host "📝 Créez le fichier .env.production avec la configuration appropriée" -ForegroundColor Yellow
    exit 1
}

# Arrêter les conteneurs existants
Write-Host "📦 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images obsolètes..." -ForegroundColor Yellow
docker system prune -f

# Reconstruire l'image avec la nouvelle configuration
Write-Host "🔨 Reconstruction de l'image Docker..." -ForegroundColor Yellow
docker build -t iahome:latest .

# Démarrer les services en mode production
Write-Host "🚀 Démarrage des services en mode production..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d

# Attendre que l'application démarre
Write-Host "⏳ Attente du démarrage de l'application..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

# Vérifier le statut des conteneurs
Write-Host "📊 Vérification du statut des conteneurs..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Vérifier la santé de l'application
Write-Host "🏥 Vérification de la santé de l'application..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible et fonctionnelle" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Application accessible mais statut inattendu: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Impossible de vérifier la santé de l'application: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "✅ Déploiement terminé avec succès !" -ForegroundColor Green
Write-Host "🌐 Accedez a l'application sur : https://iahome.fr" -ForegroundColor Green
Write-Host "📋 Pour voir les logs : docker-compose -f docker-compose.prod.yml logs -f iahome-app" -ForegroundColor Cyan
