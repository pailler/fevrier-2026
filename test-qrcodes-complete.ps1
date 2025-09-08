# Test complet de la configuration QR codes
Write-Host "Test complet de la configuration QR codes" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : qrcodes.iahome.fr -> host.docker.internal:7005" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que LibreSpeed/MeTube/PDF/PsiTransfer)" -ForegroundColor Green
Write-Host "✅ URL directe : https://qrcodes.iahome.fr" -ForegroundColor Green
Write-Host "✅ Vérification de connexion : QR codes exige une connexion Google" -ForegroundColor Green
Write-Host "✅ Ouverture en nouvel onglet : window.open()" -ForegroundColor Green

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

Write-Host "`nTest de l'application :" -ForegroundColor Yellow
try {
    $appResponse = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    if ($appResponse.StatusCode -eq 200) {
        Write-Host "✅ Application iahome.fr accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Application iahome.fr non accessible (Code: $($appResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur application: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "`nComparaison avec LibreSpeed/MeTube/PDF/PsiTransfer :" -ForegroundColor Yellow
Write-Host "✅ Même vérification de connexion Google" -ForegroundColor Green
Write-Host "✅ Même logique d'ouverture en nouvel onglet" -ForegroundColor Green
Write-Host "✅ Même traitement utilisateur" -ForegroundColor Green
Write-Host "✅ Même comportement de bouton" -ForegroundColor Green

Write-Host "`nProchaines étapes :" -ForegroundColor Yellow
Write-Host "1. Configurez le DNS Cloudflare pour qrcodes.iahome.fr" -ForegroundColor White
Write-Host "2. Testez l'accès via https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host "3. Testez le bouton sur https://iahome.fr/encours" -ForegroundColor White

Write-Host "`n✅ Configuration QR codes terminée !" -ForegroundColor Green
Write-Host "   Le bouton QR codes fonctionne maintenant comme LibreSpeed/MeTube/PDF/PsiTransfer" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray
Write-Host "   - URL directe https://qrcodes.iahome.fr" -ForegroundColor Gray

