# Script de démarrage rapide pour IAHOME en production
Write-Host "🚀 Démarrage d'IAHOME en mode production..." -ForegroundColor Green

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet" -ForegroundColor Red
    exit 1
}

# Vérifier que Docker est en cours d'exécution
try {
    docker ps > $null 2>&1
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "💡 Exécutez d'abord: .\scripts\start-docker.ps1" -ForegroundColor Yellow
    exit 1
}

# Vérifier que le fichier de configuration de production existe
if (-not (Test-Path ".env.production")) {
    Write-Host "❌ Erreur: Le fichier .env.production n'existe pas" -ForegroundColor Red
    Write-Host "📝 Créez le fichier .env.production avec la configuration appropriée" -ForegroundColor Yellow
    exit 1
}

# Arrêter les conteneurs existants s'ils sont en cours d'exécution
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Démarrer les services en mode production
Write-Host "🚀 Démarrage des services en mode production..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d

# Attendre que l'application démarre
Write-Host "⏳ Attente du démarrage de l'application..." -ForegroundColor Cyan
Start-Sleep -Seconds 15

# Vérifier le statut des conteneurs
Write-Host "📊 Vérification du statut des conteneurs..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Vérifier la santé de l'application
Write-Host "🏥 Vérification de la santé de l'application..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible et fonctionnelle" -ForegroundColor Green
        Write-Host "🌐 URL: https://iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Application accessible mais statut inattendu: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Impossible de vérifier la santé de l'application: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Vérifiez les logs avec: docker-compose -f docker-compose.prod.yml logs -f iahome-app" -ForegroundColor Cyan
}

Write-Host "`n📋 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   • Voir les logs: docker-compose -f docker-compose.prod.yml logs -f iahome-app" -ForegroundColor White
Write-Host "   • Arrêter: docker-compose -f docker-compose.prod.yml down" -ForegroundColor White
Write-Host "   • Redémarrer: docker-compose -f docker-compose.prod.yml restart" -ForegroundColor White
Write-Host "   • Dashboard Traefik: http://localhost:8080" -ForegroundColor White

Write-Host "`n✅ IAHOME est maintenant en cours d'exécution en mode production !" -ForegroundColor Green





