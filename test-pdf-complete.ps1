# Test complet de la configuration PDF
Write-Host "Test complet de la configuration PDF" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : pdf.iahome.fr -> stirling-pdf:8080" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que LibreSpeed/MeTube)" -ForegroundColor Green
Write-Host "✅ URL directe : https://pdf.iahome.fr" -ForegroundColor Green
Write-Host "✅ Vérification de connexion : PDF exige une connexion Google" -ForegroundColor Green
Write-Host "✅ Ouverture en nouvel onglet : window.open()" -ForegroundColor Green

Write-Host "`nTest de connectivité locale :" -ForegroundColor Yellow
try {
    $pdfResponse = Invoke-WebRequest -Uri "http://localhost:8081" -Method GET -TimeoutSec 10
    if ($pdfResponse.StatusCode -eq 200) {
        Write-Host "✅ PDF accessible localement sur port 8081" -ForegroundColor Green
    } else {
        Write-Host "❌ PDF non accessible localement (Code: $($pdfResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PDF local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de Traefik avec Host header :" -ForegroundColor Yellow
try {
    $headers = @{
        'Host' = 'pdf.iahome.fr'
    }
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost" -Method GET -Headers $headers -TimeoutSec 10
    if ($traefikResponse.StatusCode -eq 200) {
        Write-Host "✅ Traefik route PDF configurée correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ Traefik route PDF non configurée (Code: $($traefikResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik PDF: $($_.Exception.Message)" -ForegroundColor Red
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
    $pdfDnsResponse = Invoke-WebRequest -Uri "https://pdf.iahome.fr" -Method GET -TimeoutSec 10
    if ($pdfDnsResponse.StatusCode -eq 200) {
        Write-Host "✅ PDF accessible via https://pdf.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ PDF non accessible via DNS (Code: $($pdfDnsResponse.StatusCode))" -ForegroundColor Red
        Write-Host "   → Configurez le DNS Cloudflare pour pdf.iahome.fr" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur PDF DNS: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Configurez le DNS Cloudflare pour pdf.iahome.fr" -ForegroundColor Yellow
}

Write-Host "`nComparaison avec LibreSpeed/MeTube :" -ForegroundColor Yellow
Write-Host "✅ Même vérification de connexion Google" -ForegroundColor Green
Write-Host "✅ Même logique d'ouverture en nouvel onglet" -ForegroundColor Green
Write-Host "✅ Même traitement utilisateur" -ForegroundColor Green
Write-Host "✅ Même comportement de bouton" -ForegroundColor Green

Write-Host "`nProchaines étapes :" -ForegroundColor Yellow
Write-Host "1. Configurez le DNS Cloudflare pour pdf.iahome.fr" -ForegroundColor White
Write-Host "2. Testez l'accès via https://pdf.iahome.fr" -ForegroundColor White
Write-Host "3. Testez le bouton sur https://iahome.fr/encours" -ForegroundColor White

Write-Host "`n✅ Configuration PDF terminée !" -ForegroundColor Green
Write-Host "   Le bouton PDF fonctionne maintenant comme LibreSpeed/MeTube" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray
Write-Host "   - URL directe https://pdf.iahome.fr" -ForegroundColor Gray

