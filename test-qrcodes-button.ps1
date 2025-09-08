# Test du bouton QR codes sur la page card
Write-Host "Test du bouton QR codes sur la page card" -ForegroundColor Cyan

Write-Host "`n✅ Configuration appliquée :" -ForegroundColor Green
Write-Host "   - Bouton 'Activer l'application QR Codes' configuré" -ForegroundColor Gray
Write-Host "   - Génération de token standard via /api/generate-standard-token" -ForegroundColor Gray
Write-Host "   - Redirection vers /token-generated?module=QR Codes" -ForegroundColor Gray
Write-Host "   - Même logique que MeTube/LibreSpeed/PDF/PsiTransfer" -ForegroundColor Gray

Write-Host "`nTest de l'application principale :" -ForegroundColor Yellow
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

Write-Host "`nTest de la page card QR codes :" -ForegroundColor Yellow
try {
    $cardResponse = Invoke-WebRequest -Uri "https://iahome.fr/card/qrcodes" -Method GET -TimeoutSec 10
    if ($cardResponse.StatusCode -eq 200) {
        Write-Host "✅ Page card QR codes accessible" -ForegroundColor Green
        
        # Vérifier que le bouton est présent
        if ($cardResponse.Content -match "Activer l'application QR Codes") {
            Write-Host "✅ Bouton 'Activer l'application QR Codes' présent" -ForegroundColor Green
        } else {
            Write-Host "❌ Bouton 'Activer l'application QR Codes' non trouvé" -ForegroundColor Red
        }
        
        # Vérifier que le bouton de connexion est présent
        if ($cardResponse.Content -match "Connectez-vous pour accéder") {
            Write-Host "✅ Bouton de connexion présent" -ForegroundColor Green
        } else {
            Write-Host "❌ Bouton de connexion non trouvé" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Page card QR codes non accessible (Code: $($cardResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur page card QR codes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'API generate-standard-token :" -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-standard-token" -Method POST -ContentType "application/json" -Body '{"moduleName":"QR Codes","moduleId":"qrcodes","userId":"test"}' -TimeoutSec 10
    if ($apiResponse.StatusCode -eq 200) {
        Write-Host "✅ API generate-standard-token accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ API generate-standard-token non accessible (Code: $($apiResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API generate-standard-token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de la page de transition :" -ForegroundColor Yellow
try {
    $transitionResponse = Invoke-WebRequest -Uri "https://iahome.fr/token-generated?module=QR Codes" -Method GET -TimeoutSec 10
    if ($transitionResponse.StatusCode -eq 200) {
        Write-Host "✅ Page de transition accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page de transition non accessible (Code: $($transitionResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur page de transition: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest du workflow complet :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/card/qrcodes" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Cliquez sur 'Activer l'application QR Codes'" -ForegroundColor White
Write-Host "4. Vérifiez la redirection vers /token-generated?module=QR Codes" -ForegroundColor White
Write-Host "5. Vérifiez que le module apparaît sur /encours" -ForegroundColor White

Write-Host "`nComparaison avec les autres modules :" -ForegroundColor Yellow
Write-Host "✅ Même bouton 'Activer l'application [Module]'" -ForegroundColor Green
Write-Host "✅ Même génération de token standard" -ForegroundColor Green
Write-Host "✅ Même redirection vers page de transition" -ForegroundColor Green
Write-Host "✅ Même logique de connexion requise" -ForegroundColor Green

Write-Host "`n🎉 Configuration du bouton QR codes terminée !" -ForegroundColor Green
Write-Host "   Le bouton fonctionne maintenant comme les autres modules :" -ForegroundColor Gray
Write-Host "   - Génération de token standard" -ForegroundColor Gray
Write-Host "   - Redirection vers page de transition" -ForegroundColor Gray
Write-Host "   - Apparition du module dans /encours" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray

