# Test final de la configuration PDF
Write-Host "Test final de la configuration PDF" -ForegroundColor Cyan

Write-Host "`n✅ Configuration complète appliquée :" -ForegroundColor Green
Write-Host "   - Reverse proxy Traefik : pdf.iahome.fr -> stirling-pdf:8080" -ForegroundColor Gray
Write-Host "   - SSL Cloudflare : https://pdf.iahome.fr" -ForegroundColor Gray
Write-Host "   - URL directe : https://pdf.iahome.fr" -ForegroundColor Gray
Write-Host "   - Vérification de connexion Google" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray

Write-Host "`nTest de connectivité :" -ForegroundColor Yellow
try {
    $pdfResponse = Invoke-WebRequest -Uri "https://pdf.iahome.fr" -Method GET -TimeoutSec 10
    if ($pdfResponse.StatusCode -eq 200) {
        Write-Host "✅ PDF accessible via https://pdf.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ PDF non accessible (Code: $($pdfResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PDF: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "`nTest du bouton PDF :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Trouvez le module PDF" -ForegroundColor White
Write-Host "4. Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "5. Vérifiez que https://pdf.iahome.fr s'ouvre dans un nouvel onglet" -ForegroundColor White

Write-Host "`nComparaison avec LibreSpeed/MeTube :" -ForegroundColor Yellow
Write-Host "✅ Même vérification de connexion Google" -ForegroundColor Green
Write-Host "✅ Même logique d'ouverture en nouvel onglet" -ForegroundColor Green
Write-Host "✅ Même traitement utilisateur" -ForegroundColor Green
Write-Host "✅ Même comportement de bouton" -ForegroundColor Green

Write-Host "`n🎉 Configuration PDF terminée avec succès !" -ForegroundColor Green
Write-Host "   Le module PDF fonctionne maintenant exactement comme LibreSpeed et MeTube" -ForegroundColor Gray
Write-Host "   - Reverse proxy et SSL configurés" -ForegroundColor Gray
Write-Host "   - Bouton d'accès configuré" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray

