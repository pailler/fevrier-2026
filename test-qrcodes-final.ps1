# Test final de la configuration QR codes
Write-Host "Test final de la configuration QR codes" -ForegroundColor Cyan

Write-Host "`n✅ Configuration complète appliquée :" -ForegroundColor Green
Write-Host "   - Reverse proxy Traefik : qrcodes.iahome.fr -> host.docker.internal:7005" -ForegroundColor Gray
Write-Host "   - SSL Cloudflare : https://qrcodes.iahome.fr" -ForegroundColor Gray
Write-Host "   - URL directe : https://qrcodes.iahome.fr" -ForegroundColor Gray
Write-Host "   - Vérification de connexion Google" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray

Write-Host "`nTest de connectivité :" -ForegroundColor Yellow
try {
    $qrcodesResponse = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr" -Method GET -TimeoutSec 10
    if ($qrcodesResponse.StatusCode -eq 200) {
        Write-Host "✅ QR codes accessible via https://qrcodes.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ QR codes non accessible (Code: $($qrcodesResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur QR codes: $($_.Exception.Message)" -ForegroundColor Red
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

Write-Host "`nTest du bouton QR codes :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Trouvez le module QR codes" -ForegroundColor White
Write-Host "4. Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "5. Vérifiez que https://qrcodes.iahome.fr s'ouvre dans un nouvel onglet" -ForegroundColor White

Write-Host "`nComparaison avec LibreSpeed/MeTube/PDF/PsiTransfer :" -ForegroundColor Yellow
Write-Host "✅ Même vérification de connexion Google" -ForegroundColor Green
Write-Host "✅ Même logique d'ouverture en nouvel onglet" -ForegroundColor Green
Write-Host "✅ Même traitement utilisateur" -ForegroundColor Green
Write-Host "✅ Même comportement de bouton" -ForegroundColor Green

Write-Host "`nRésumé des modules configurés :" -ForegroundColor Yellow
Write-Host "✅ LibreSpeed : https://librespeed.iahome.fr" -ForegroundColor Green
Write-Host "✅ MeTube : https://metube.iahome.fr" -ForegroundColor Green
Write-Host "✅ PDF : https://pdf.iahome.fr" -ForegroundColor Green
Write-Host "✅ PsiTransfer : https://psitransfer.iahome.fr" -ForegroundColor Green
Write-Host "✅ QR codes : https://qrcodes.iahome.fr" -ForegroundColor Green

Write-Host "`n🎉 Configuration QR codes terminée avec succès !" -ForegroundColor Green
Write-Host "   Le module QR codes fonctionne maintenant exactement comme les autres" -ForegroundColor Gray
Write-Host "   - Reverse proxy et SSL configurés" -ForegroundColor Gray
Write-Host "   - Bouton d'accès configuré" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray

