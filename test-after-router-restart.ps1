# Script de test après redémarrage de la box
Write-Host "🧪 TEST APRÈS REDÉMARRAGE DE LA BOX" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n⏳ Attente de la stabilisation de la connexion..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 1. Vérifier la connectivité de base
Write-Host "`n🌐 1. Test de connectivité de base:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://www.google.com" -Method GET -TimeoutSec 10
    Write-Host "✅ Connexion internet OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ Problème de connexion internet: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Vérifier les services locaux
Write-Host "`n🏠 2. Vérification des services locaux:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    Write-Host "✅ IAHome App locale OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ IAHome App locale non accessible" -ForegroundColor Red
}

# 3. Redémarrer Cloudflared
Write-Host "`n🔄 3. Redémarrage de Cloudflared:" -ForegroundColor Yellow
docker-compose -f docker-compose.cloudflared.yml down
Start-Sleep -Seconds 3
docker-compose -f docker-compose.cloudflared.yml up -d
Write-Host "✅ Cloudflared redémarré" -ForegroundColor Green

# 4. Attendre la connexion
Write-Host "`n⏳ 4. Attente de la connexion tunnel (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 5. Vérifier les logs
Write-Host "`n📋 5. Logs Cloudflared:" -ForegroundColor Yellow
docker logs iahome-cloudflared --tail 5

# 6. Test de l'accès externe
Write-Host "`n🌍 6. Test de l'accès externe:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 15
    Write-Host "✅ https://iahome.fr accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "🎉 SUCCÈS ! Le site est accessible !" -ForegroundColor Green
} catch {
    Write-Host "❌ https://iahome.fr non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Le problème persiste, vérifiez d'autres causes possibles" -ForegroundColor Yellow
}

Write-Host "`n✅ Test terminé !" -ForegroundColor Cyan
