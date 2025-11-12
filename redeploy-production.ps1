# Script de redéploiement de l'application IAHome en production
# Ce script reconstruit et redémarre le conteneur Docker avec les dernières modifications

Write-Host "🚀 Redéploiement de l'application IAHome en production" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Aller dans le répertoire du projet
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n📥 Récupération des dernières modifications depuis GitHub..." -ForegroundColor Yellow
git pull origin main

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Avertissement: Erreur lors du pull Git (peut-être déjà à jour)" -ForegroundColor Yellow
}

Write-Host "`n🛑 Arrêt du conteneur existant..." -ForegroundColor Red
docker-compose -f docker-compose.prod.yml down

Write-Host "`n🗑️  Nettoyage des images anciennes..." -ForegroundColor Yellow
docker image prune -f

Write-Host "`n🔨 Reconstruction de l'image Docker avec les dernières modifications..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la reconstruction de l'image Docker" -ForegroundColor Red
    exit 1
}

Write-Host "`n🚀 Démarrage du conteneur en production..." -ForegroundColor Green
docker-compose -f docker-compose.prod.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du démarrage du conteneur" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Attente du démarrage de l'application (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`n📊 Vérification du statut du conteneur..." -ForegroundColor Blue
docker-compose -f docker-compose.prod.yml ps

Write-Host "`n📋 Logs du conteneur (dernières 20 lignes):" -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs --tail 20 iahome-app

Write-Host "`n✅ Redéploiement terminé !" -ForegroundColor Green
Write-Host "🌐 L'application devrait être accessible sur https://iahome.fr" -ForegroundColor Green
Write-Host "`n💡 N'oubliez pas de vider le cache de votre navigateur (Ctrl+Shift+Delete) pour voir les modifications." -ForegroundColor Yellow




