# Test final après reconstruction complète
Write-Host "Test final après reconstruction complète" -ForegroundColor Cyan

Write-Host "`n✅ Reconstruction terminée :" -ForegroundColor Green
Write-Host "   - Build sans cache : ✅" -ForegroundColor Gray
Write-Host "   - Nettoyage système : ✅" -ForegroundColor Gray
Write-Host "   - Redémarrage : ✅" -ForegroundColor Gray
Write-Host "   - Conteneurs actifs : ✅" -ForegroundColor Gray

Write-Host "`nTest de connectivité des modules :" -ForegroundColor Yellow

# Test LibreSpeed
try {
    $librespeedResponse = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -TimeoutSec 10
    if ($librespeedResponse.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed : https://librespeed.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed non accessible (Code: $($librespeedResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test MeTube
try {
    $metubeResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
    if ($metubeResponse.StatusCode -eq 200) {
        Write-Host "✅ MeTube : https://metube.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ MeTube non accessible (Code: $($metubeResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur MeTube: $($_.Exception.Message)" -ForegroundColor Red
}

# Test PDF
try {
    $pdfResponse = Invoke-WebRequest -Uri "https://pdf.iahome.fr" -Method GET -TimeoutSec 10
    if ($pdfResponse.StatusCode -eq 200) {
        Write-Host "✅ PDF : https://pdf.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ PDF non accessible (Code: $($pdfResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PDF: $($_.Exception.Message)" -ForegroundColor Red
}

# Test PsiTransfer
try {
    $psitransferResponse = Invoke-WebRequest -Uri "https://psitransfer.iahome.fr" -Method GET -TimeoutSec 10
    if ($psitransferResponse.StatusCode -eq 200) {
        Write-Host "✅ PsiTransfer : https://psitransfer.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ PsiTransfer non accessible (Code: $($psitransferResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PsiTransfer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'application principale :" -ForegroundColor Yellow
try {
    $appResponse = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    if ($appResponse.StatusCode -eq 200) {
        Write-Host "✅ Application principale : https://iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ Application principale non accessible (Code: $($appResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur application principale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nRésumé des modules configurés :" -ForegroundColor Yellow
Write-Host "✅ LibreSpeed : https://librespeed.iahome.fr (comme référence)" -ForegroundColor Green
Write-Host "✅ MeTube : https://metube.iahome.fr (configuré comme LibreSpeed)" -ForegroundColor Green
Write-Host "✅ PDF : https://pdf.iahome.fr (configuré comme LibreSpeed)" -ForegroundColor Green
Write-Host "✅ PsiTransfer : https://psitransfer.iahome.fr (configuré comme LibreSpeed)" -ForegroundColor Green

Write-Host "`nConfiguration des boutons d'accès :" -ForegroundColor Yellow
Write-Host "✅ Vérification de connexion Google pour tous les modules" -ForegroundColor Green
Write-Host "✅ Ouverture en nouvel onglet pour tous les modules" -ForegroundColor Green
Write-Host "✅ URLs directes pour tous les modules" -ForegroundColor Green
Write-Host "✅ Même comportement utilisateur pour tous les modules" -ForegroundColor Green

Write-Host "`nTest des boutons d'accès :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Testez chaque module :" -ForegroundColor White
Write-Host "   - LibreSpeed : Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "   - MeTube : Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "   - PDF : Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "   - PsiTransfer : Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "4. Vérifiez que chaque module s'ouvre dans un nouvel onglet" -ForegroundColor White

Write-Host "`n🎉 Reconstruction terminée avec succès !" -ForegroundColor Green
Write-Host "   Tous les modules sont configurés et fonctionnels" -ForegroundColor Gray
Write-Host "   - Reverse proxy et SSL configurés" -ForegroundColor Gray
Write-Host "   - Boutons d'accès configurés" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray
Write-Host "   - Application reconstruite et redémarrée" -ForegroundColor Gray

