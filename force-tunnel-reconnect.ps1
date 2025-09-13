# Script pour forcer la reconnexion du tunnel Cloudflared
Write-Host "🔄 Reconnexion forcée du tunnel iahome-tunnel" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

# Arrêter tous les conteneurs Cloudflared
Write-Host "⏹️  Arrêt des conteneurs Cloudflared..." -ForegroundColor Yellow
docker stop iahome-cloudflared 2>$null
docker rm iahome-cloudflared 2>$null

# Attendre un peu
Start-Sleep -Seconds 3

# Vérifier que l'application fonctionne
Write-Host "🔍 Vérification de l'application locale..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ Application locale accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Application locale non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🚀 Démarrage de l'application..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml up -d
    Start-Sleep -Seconds 10
}

# Redémarrer Cloudflared
Write-Host "🚀 Redémarrage de Cloudflared..." -ForegroundColor Green
docker-compose -f docker-compose.cloudflared.yml up -d

# Attendre la connexion
Write-Host "⏳ Attente de la connexion tunnel..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Vérifier le statut
Write-Host "📊 Vérification du statut..." -ForegroundColor Cyan
docker ps | findstr cloudflared

Write-Host "📋 Logs récents:" -ForegroundColor Cyan
docker logs iahome-cloudflared --tail 10

Write-Host "🌐 Test de l'accès externe..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    Write-Host "✅ Site accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Site non accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Vérifiez la configuration dans le dashboard Cloudflare" -ForegroundColor White
    Write-Host "🔗 https://one.dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/networks/tunnels/cfd_tunnel/b19084f4-e2d6-47f5-81c3-0972662e953c/edit?tab=publicHostname" -ForegroundColor Blue
}

Write-Host "✅ Script terminé!" -ForegroundColor Green
