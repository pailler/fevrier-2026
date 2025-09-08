# Script pour mettre à jour la configuration du tunnel Cloudflare
# Ce script met à jour la configuration pour router librespeed.iahome.fr vers Traefik (port 80)

Write-Host "Mise à jour de la configuration du tunnel Cloudflare..." -ForegroundColor Green

# Arrêter cloudflared
Write-Host "Arrêt de cloudflared..." -ForegroundColor Yellow
docker stop cloudflared

# Attendre un moment
Start-Sleep -Seconds 2

# Redémarrer cloudflared
Write-Host "Redémarrage de cloudflared..." -ForegroundColor Yellow
docker start cloudflared

# Attendre que le service démarre
Write-Host "Attente du démarrage de cloudflared..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier les logs
Write-Host "Vérification des logs cloudflared..." -ForegroundColor Yellow
docker logs cloudflared --tail=5

Write-Host "Configuration mise à jour !" -ForegroundColor Green
Write-Host "Le tunnel devrait maintenant router librespeed.iahome.fr vers Traefik (port 80)" -ForegroundColor Cyan
