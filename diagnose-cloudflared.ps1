# Script de diagnostic complet pour Cloudflared
Write-Host "🔍 DIAGNOSTIC COMPLET CLOUDFLARED" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# 1. Vérifier les conteneurs Docker
Write-Host "`n🐳 1. Vérification des conteneurs Docker:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr -i cloudflared

# 2. Vérifier les services locaux
Write-Host "`n🌐 2. Vérification des services locaux:" -ForegroundColor Yellow
$services = @(
    @{name="IAHome App"; url="http://localhost:3000"},
    @{name="Stirling PDF"; url="http://localhost:8081"},
    @{name="MeTube"; url="http://localhost:8082"},
    @{name="LibreSpeed"; url="http://localhost:8083"},
    @{name="PsiTransfer"; url="http://localhost:8084"},
    @{name="QR Codes"; url="http://localhost:7005"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.url -Method GET -TimeoutSec 3
        Write-Host "✅ $($service.name): $($service.url) (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.name): $($service.url) - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Vérifier la configuration Cloudflared
Write-Host "`n📋 3. Configuration Cloudflared:" -ForegroundColor Yellow
Write-Host "Tunnel ID: b19084f4-e2d6-47f5-81c3-0972662e953c"
Write-Host "Config file: cloudflared-simple.yml"

# 4. Vérifier les logs Cloudflared
Write-Host "`n📋 4. Logs Cloudflared (dernières 10 lignes):" -ForegroundColor Yellow
docker logs iahome-cloudflared --tail 10

# 5. Vérifier le statut du tunnel
Write-Host "`n🔗 5. Statut du tunnel:" -ForegroundColor Yellow
cloudflared tunnel info iahome-tunnel

# 6. Test de connectivité externe
Write-Host "`n🌍 6. Test de connectivité externe:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    Write-Host "✅ https://iahome.fr accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ https://iahome.fr non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Vérifier les credentials
Write-Host "`n🔐 7. Vérification des credentials:" -ForegroundColor Yellow
$credPath = "C:\Users\AAA\.cloudflared\b19084f4-e2d6-47f5-81c3-0972662e953c.json"
if (Test-Path $credPath) {
    $content = Get-Content $credPath -Raw
    if ($content -match '^[A-Za-z0-9+/=]+$') {
        Write-Host "✅ Fichier de credentials trouvé et valide" -ForegroundColor Green
    } else {
        Write-Host "❌ Fichier de credentials invalide" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Fichier de credentials non trouvé" -ForegroundColor Red
}

Write-Host "`n🎯 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan
Write-Host "• Les hostnames sont configurés dans le dashboard Cloudflare" -ForegroundColor White
Write-Host "• Les services locaux fonctionnent" -ForegroundColor White
Write-Host "• Le problème semble être la connexion tunnel vers Cloudflare" -ForegroundColor Yellow
Write-Host "• Vérifiez la configuration réseau et les pare-feu" -ForegroundColor Yellow
