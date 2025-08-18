# Script d'arrêt pour IAHOME en production
Write-Host "🛑 Arrêt d'IAHOME en mode production..." -ForegroundColor Yellow

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
    exit 1
}

# Afficher le statut actuel des conteneurs
Write-Host "📊 Statut actuel des conteneurs:" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Arrêter les services
Write-Host "🛑 Arrêt des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Vérifier que les conteneurs sont arrêtés
Write-Host "📊 Vérification de l'arrêt des conteneurs..." -ForegroundColor Cyan
$containers = docker ps -a --filter "name=iahome" --format "table {{.Names}}\t{{.Status}}"
if ($containers) {
    Write-Host "📋 Conteneurs IAHOME:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} else {
    Write-Host "✅ Aucun conteneur IAHOME en cours d'exécution" -ForegroundColor Green
}

Write-Host "`n✅ IAHOME a été arrêté avec succès !" -ForegroundColor Green
Write-Host "💡 Pour redémarrer, exécutez: .\scripts\start-iahome-production.ps1" -ForegroundColor Cyan





