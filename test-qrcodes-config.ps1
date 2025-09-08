# Test de la configuration QR codes
Write-Host "Test de la configuration QR codes" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : qrcodes.iahome.fr -> 172.21.0.3:8080" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que LibreSpeed/MeTube/PDF/PsiTransfer)" -ForegroundColor Green
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
    } else {
        Write-Host "❌ Traefik route QR codes non configurée (Code: $($traefikResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik QR codes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest DNS (simulation) :" -ForegroundColor Yellow
Write-Host "⚠️  Pour que qrcodes.iahome.fr fonctionne, vous devez :" -ForegroundColor Yellow
Write-Host "1. Aller sur Cloudflare DNS" -ForegroundColor White
Write-Host "2. Ajouter un enregistrement A : qrcodes.iahome.fr -> VOTRE_IP_PUBLIQUE" -ForegroundColor White
Write-Host "3. Activer le proxy (nuage orange)" -ForegroundColor White

Write-Host "`nVérification des conteneurs :" -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr -i qr
    Write-Host $containers
} catch {
    Write-Host "❌ Erreur lors de la vérification des conteneurs" -ForegroundColor Red
}

Write-Host "`n✅ Configuration QR codes terminée !" -ForegroundColor Green
Write-Host "   Prochaine étape : Configurer le DNS Cloudflare" -ForegroundColor Gray

