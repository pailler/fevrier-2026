# Script de redémarrage du service QR Codes avec base de données
Write-Host "🔄 Redémarrage du service QR Codes avec base de données..." -ForegroundColor Yellow

# Arrêter les services existants
Write-Host "⏹️  Arrêt des services existants..." -ForegroundColor Red
docker-compose down

# Supprimer les images anciennes (optionnel)
Write-Host "🗑️  Nettoyage des images anciennes..." -ForegroundColor Yellow
docker image prune -f

# Reconstruire et démarrer les services
Write-Host "🔨 Reconstruction et démarrage des services..." -ForegroundColor Green
docker-compose up --build -d

# Vérifier le statut des services
Write-Host "📊 Vérification du statut des services..." -ForegroundColor Blue
docker-compose ps

# Afficher les logs
Write-Host "📋 Logs du service QR Codes:" -ForegroundColor Cyan
docker-compose logs -f qrcodes





































