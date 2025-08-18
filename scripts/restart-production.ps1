# Script de redémarrage en production pour IAHOME.FR
Write-Host "🚀 Redémarrage de l'application IAHOME en mode production..." -ForegroundColor Green

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

# Vérifier le statut des conteneurs
Write-Host "📊 Vérification du statut des conteneurs..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml ps

# Afficher les logs pour vérifier le démarrage
Write-Host "📋 Logs de démarrage (appuyez sur Ctrl+C pour arrêter)..." -ForegroundColor Cyan
docker-compose -f docker-compose.prod.yml logs -f iahome-app

Write-Host "✅ Application redémarrée avec succès !" -ForegroundColor Green
Write-Host "🌐 Accédez à l'application sur : https://iahome.fr" -ForegroundColor Green






