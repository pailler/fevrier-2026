# Script pour redémarrer Cloudflared avec la configuration correcte
Write-Host "🔄 Redémarrage de Cloudflared pour iahome.fr" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Arrêter le conteneur existant
Write-Host "⏹️  Arrêt du conteneur Cloudflared..." -ForegroundColor Yellow
docker-compose -f docker-compose.cloudflared.yml down

# Attendre un peu
Start-Sleep -Seconds 2

# Redémarrer avec la configuration
Write-Host "🚀 Démarrage de Cloudflared..." -ForegroundColor Green
docker-compose -f docker-compose.cloudflared.yml up -d

# Attendre que le service démarre
Write-Host "⏳ Attente du démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut
Write-Host "📊 Vérification du statut..." -ForegroundColor Cyan
docker ps | findstr cloudflared

Write-Host "📋 Logs récents:" -ForegroundColor Cyan
docker logs iahome-cloudflared --tail 10

Write-Host "✅ Redémarrage terminé!" -ForegroundColor Green
Write-Host "🌐 Testez l'accès à https://iahome.fr" -ForegroundColor White