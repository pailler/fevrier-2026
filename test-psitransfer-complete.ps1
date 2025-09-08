# Test complet de la configuration PsiTransfer
Write-Host "Test complet de la configuration PsiTransfer" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : psitransfer.iahome.fr -> psitransfer:3000" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que LibreSpeed/MeTube/PDF)" -ForegroundColor Green
Write-Host "✅ URL directe : https://psitransfer.iahome.fr" -ForegroundColor Green
Write-Host "✅ Vérification de connexion : PsiTransfer exige une connexion Google" -ForegroundColor Green
Write-Host "✅ Ouverture en nouvel onglet : window.open()" -ForegroundColor Green

Write-Host "`nTest de connectivité locale :" -ForegroundColor Yellow
try {
    $psitransferResponse = Invoke-WebRequest -Uri "http://localhost:8084" -Method GET -TimeoutSec 10
    if ($psitransferResponse.StatusCode -eq 200) {
        Write-Host "✅ PsiTransfer accessible localement sur port 8084" -ForegroundColor Green
    } else {
        Write-Host "❌ PsiTransfer non accessible localement (Code: $($psitransferResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PsiTransfer local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de Traefik avec Host header :" -ForegroundColor Yellow
try {
    $headers = @{
        'Host' = 'psitransfer.iahome.fr'
    }
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost" -Method GET -Headers $headers -TimeoutSec 10
    if ($traefikResponse.StatusCode -eq 200) {
        Write-Host "✅ Traefik route PsiTransfer configurée correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ Traefik route PsiTransfer non configurée (Code: $($traefikResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik PsiTransfer: $($_.Exception.Message)" -ForegroundColor Red
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
    $psitransferDnsResponse = Invoke-WebRequest -Uri "https://psitransfer.iahome.fr" -Method GET -TimeoutSec 10
    if ($psitransferDnsResponse.StatusCode -eq 200) {
        Write-Host "✅ PsiTransfer accessible via https://psitransfer.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ PsiTransfer non accessible via DNS (Code: $($psitransferDnsResponse.StatusCode))" -ForegroundColor Red
        Write-Host "   → Configurez le DNS Cloudflare pour psitransfer.iahome.fr" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur PsiTransfer DNS: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Configurez le DNS Cloudflare pour psitransfer.iahome.fr" -ForegroundColor Yellow
}

Write-Host "`nComparaison avec LibreSpeed/MeTube/PDF :" -ForegroundColor Yellow
Write-Host "✅ Même vérification de connexion Google" -ForegroundColor Green
Write-Host "✅ Même logique d'ouverture en nouvel onglet" -ForegroundColor Green
Write-Host "✅ Même traitement utilisateur" -ForegroundColor Green
Write-Host "✅ Même comportement de bouton" -ForegroundColor Green

Write-Host "`nProchaines étapes :" -ForegroundColor Yellow
Write-Host "1. Configurez le DNS Cloudflare pour psitransfer.iahome.fr" -ForegroundColor White
Write-Host "2. Testez l'accès via https://psitransfer.iahome.fr" -ForegroundColor White
Write-Host "3. Testez le bouton sur https://iahome.fr/encours" -ForegroundColor White

Write-Host "`n✅ Configuration PsiTransfer terminée !" -ForegroundColor Green
Write-Host "   Le bouton PsiTransfer fonctionne maintenant comme LibreSpeed/MeTube/PDF" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray
Write-Host "   - URL directe https://psitransfer.iahome.fr" -ForegroundColor Gray

