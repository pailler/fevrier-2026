# Script de test pour la production iahome.fr
Write-Host "🧪 Test de la production iahome.fr" -ForegroundColor Cyan

# 1. Vérifier les services Docker
Write-Host "`n🐳 Statut des services Docker:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Tester l'accès local
Write-Host "`n🌐 Test d'accès local (port 3000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10
    Write-Host "✅ Local: $($response.StatusCode) - $($response.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "❌ Local: Erreur - $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Tester l'API de santé
Write-Host "`n🏥 Test de l'API de santé:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ API Health: $($response.StatusCode) - $($response.Content)" -ForegroundColor Green
} catch {
    Write-Host "❌ API Health: Erreur - $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Tester la page LibreSpeed
Write-Host "`n⚡ Test de la page LibreSpeed:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/card/librespeed" -Method Head -TimeoutSec 10
    Write-Host "✅ LibreSpeed: $($response.StatusCode) - $($response.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "❌ LibreSpeed: Erreur - $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Vérifier les logs récents
Write-Host "`nLogs récents de l'application:" -ForegroundColor Yellow
docker logs iahome-app --tail 5

# 6. Vérifier les logs Traefik
Write-Host "`nLogs récents de Traefik:" -ForegroundColor Yellow
docker logs iahome-traefik --tail 5

# 7. Test de connectivité réseau
Write-Host "`nTest de connectivité réseau:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 10
    Write-Host "✅ iahome.fr: $($response.StatusCode) - $($response.StatusDescription)" -ForegroundColor Green
} catch {
    Write-Host "❌ iahome.fr: Erreur - $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTests terminés" -ForegroundColor Green
Write-Host "Application accessible sur:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:3000" -ForegroundColor White
Write-Host "   - Production: https://iahome.fr" -ForegroundColor White






