# Test de la configuration QR codes avec host.docker.internal
Write-Host "Test de la configuration QR codes avec host.docker.internal" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : qrcodes.iahome.fr -> host.docker.internal:7005" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que les autres modules)" -ForegroundColor Green
Write-Host "✅ Middlewares : security-headers, compress" -ForegroundColor Green

Write-Host "`nTest de connectivité locale :" -ForegroundColor Yellow
try {
    $qrcodesResponse = Invoke-WebRequest -Uri "http://localhost:7005" -Method GET -TimeoutSec 10
    if ($qrcodesResponse.StatusCode -eq 200) {
        Write-Host "✅ QR codes accessible localement sur port 7005" -ForegroundColor Green
    } else {
        Write-Host "❌ QR codes non accessible localement (Code: $($qrcodesResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur QR codes local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de Traefik avec Host header :" -ForegroundColor Yellow
try {
    $headers = @{
        'Host' = 'qrcodes.iahome.fr'
    }
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost" -Method GET -Headers $headers -TimeoutSec 10
    if ($traefikResponse.StatusCode -eq 200) {
        Write-Host "✅ Traefik route QR codes configurée correctement" -ForegroundColor Green
        Write-Host "   Taille de la réponse : $($traefikResponse.Content.Length) caractères" -ForegroundColor Gray
    } else {
        Write-Host "❌ Traefik route QR codes non configurée (Code: $($traefikResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik QR codes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest DNS (si configuré) :" -ForegroundColor Yellow
try {
    $qrcodesDnsResponse = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr" -Method GET -TimeoutSec 10
    if ($qrcodesDnsResponse.StatusCode -eq 200) {
        Write-Host "✅ QR codes accessible via https://qrcodes.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ QR codes non accessible via DNS (Code: $($qrcodesDnsResponse.StatusCode))" -ForegroundColor Red
        Write-Host "   → Configurez le DNS Cloudflare pour qrcodes.iahome.fr" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur QR codes DNS: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Configurez le DNS Cloudflare pour qrcodes.iahome.fr" -ForegroundColor Yellow
}

Write-Host "`nProchaines étapes :" -ForegroundColor Yellow
Write-Host "1. Configurez le DNS Cloudflare pour qrcodes.iahome.fr" -ForegroundColor White
Write-Host "2. Testez l'accès via https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host "3. Configurez le bouton d'accès comme LibreSpeed" -ForegroundColor White

Write-Host "`n✅ Configuration QR codes terminée !" -ForegroundColor Green
Write-Host "   Le reverse proxy est configuré avec host.docker.internal" -ForegroundColor Gray

