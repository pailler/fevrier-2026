# Script de démarrage des services locaux
Write-Host "🚀 Démarrage des services IAHome" -ForegroundColor Green

# Démarrer l'application principale
Write-Host "📱 Démarrage de IAHome..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d iahome-app

# Démarrer les services
Write-Host "🔧 Démarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d

# Démarrer Traefik
Write-Host "🌐 Démarrage de Traefik..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d iahome-traefik

Write-Host "
✅ Services démarrés !" -ForegroundColor Green
Write-Host "
📋 Accès local aux services:" -ForegroundColor Cyan
Write-Host "- IAHome: http://localhost:3000" -ForegroundColor White
Write-Host "- LibreSpeed: http://localhost:8083" -ForegroundColor White
Write-Host "- PDF+: http://localhost:8080/pdf" -ForegroundColor White
Write-Host "- Metube: http://localhost:8080/metube" -ForegroundColor White
Write-Host "- PSITransfer: http://localhost:8080/psitransfer" -ForegroundColor White
Write-Host "- QRcodes: http://localhost:8080/qrcodes" -ForegroundColor White

Write-Host "
🔧 Pour résoudre Cloudflared:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous au dashboard Cloudflare" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Vérifiez que le tunnel 'b19084f4-e2d6-47f5-81c3-0972662e953c' existe" -ForegroundColor White
Write-Host "4. Si nécessaire, créez un nouveau tunnel" -ForegroundColor White
Write-Host "5. Copiez le nouveau token et remplacez-le dans les scripts" -ForegroundColor White
