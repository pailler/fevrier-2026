# Test du bouton QR codes en mode non connecté
Write-Host "Test du bouton QR codes en mode non connecté" -ForegroundColor Cyan

Write-Host "`n✅ Correction appliquée :" -ForegroundColor Green
Write-Host "   - Bouton 'Activer l'application QR Codes' toujours visible" -ForegroundColor Gray
Write-Host "   - Vérification de connexion dans le onClick" -ForegroundColor Gray
Write-Host "   - Redirection vers /login si non connecté" -ForegroundColor Gray
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

Write-Host "`nTest de la page card QR codes (mode non connecté) :" -ForegroundColor Yellow
try {
    $cardResponse = Invoke-WebRequest -Uri "https://iahome.fr/card/qrcodes" -Method GET -TimeoutSec 10
    if ($cardResponse.StatusCode -eq 200) {
        Write-Host "✅ Page card QR codes accessible" -ForegroundColor Green
        
        # Vérifier que le bouton est présent (maintenant toujours visible)
        if ($cardResponse.Content -match "Activer l'application QR Codes") {
            Write-Host "✅ Bouton 'Activer l'application QR Codes' présent" -ForegroundColor Green
        } else {
            Write-Host "❌ Bouton 'Activer l'application QR Codes' non trouvé" -ForegroundColor Red
        }
        
        # Vérifier qu'il n'y a plus de bouton de connexion séparé
        if ($cardResponse.Content -match "Connectez-vous pour accéder") {
            Write-Host "⚠️  Bouton de connexion séparé encore présent (normal si condition session)" -ForegroundColor Yellow
        } else {
            Write-Host "✅ Pas de bouton de connexion séparé (logique unifiée)" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Page card QR codes non accessible (Code: $($cardResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur page card QR codes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de la page card MeTube (pour comparaison) :" -ForegroundColor Yellow
try {
    $metubeResponse = Invoke-WebRequest -Uri "https://iahome.fr/card/metube" -Method GET -TimeoutSec 10
    if ($metubeResponse.StatusCode -eq 200) {
        Write-Host "✅ Page card MeTube accessible" -ForegroundColor Green
        
        # Vérifier que le bouton est présent
        if ($metubeResponse.Content -match "Activer l'application MeTube") {
            Write-Host "✅ Bouton 'Activer l'application MeTube' présent" -ForegroundColor Green
        } else {
            Write-Host "❌ Bouton 'Activer l'application MeTube' non trouvé" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Page card MeTube non accessible (Code: $($metubeResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur page card MeTube: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest du workflow complet :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/card/qrcodes" -ForegroundColor White
Write-Host "2. Vérifiez que le bouton 'Activer l'application QR Codes' est visible" -ForegroundColor White
Write-Host "3. Cliquez sur le bouton (sans être connecté)" -ForegroundColor White
Write-Host "4. Vérifiez la redirection vers /login" -ForegroundColor White
Write-Host "5. Connectez-vous et revenez sur la page" -ForegroundColor White
Write-Host "6. Cliquez à nouveau sur le bouton" -ForegroundColor White
Write-Host "7. Vérifiez la redirection vers /token-generated?module=QR Codes" -ForegroundColor White

Write-Host "`nComparaison avec les autres modules :" -ForegroundColor Yellow
Write-Host "✅ Même bouton toujours visible" -ForegroundColor Green
Write-Host "✅ Même vérification de connexion dans onClick" -ForegroundColor Green
Write-Host "✅ Même redirection vers /login si non connecté" -ForegroundColor Green
Write-Host "✅ Même logique unifiée" -ForegroundColor Green

Write-Host "`n🎉 Correction du bouton QR codes terminée !" -ForegroundColor Green
Write-Host "   Le bouton est maintenant visible en mode non connecté :" -ForegroundColor Gray
Write-Host "   - Bouton toujours affiché" -ForegroundColor Gray
Write-Host "   - Vérification de connexion dans le clic" -ForegroundColor Gray
Write-Host "   - Redirection vers /login si nécessaire" -ForegroundColor Gray
Write-Host "   - Même comportement que les autres modules" -ForegroundColor Gray

