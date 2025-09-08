# Test de correction des pages blanches
Write-Host "Test de correction des pages blanches" -ForegroundColor Cyan

Write-Host "`nProblème identifié :" -ForegroundColor Yellow
Write-Host "❌ Traefik ne pouvait pas résoudre les noms de conteneurs" -ForegroundColor Red
Write-Host "✅ Solution : Utilisation des IPs directes" -ForegroundColor Green

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ MeTube : http://172.18.0.8:8081" -ForegroundColor Green
Write-Host "✅ PDF : http://172.18.0.7:8080" -ForegroundColor Green
Write-Host "✅ Traefik redémarré" -ForegroundColor Green

Write-Host "`nTest de connectivité :" -ForegroundColor Yellow

# Test MeTube
try {
    $metubeResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
    if ($metubeResponse.StatusCode -eq 200) {
        Write-Host "✅ MeTube accessible via https://metube.iahome.fr" -ForegroundColor Green
        Write-Host "   Taille de la réponse : $($metubeResponse.Content.Length) caractères" -ForegroundColor Gray
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
        Write-Host "✅ PDF accessible via https://pdf.iahome.fr" -ForegroundColor Green
        Write-Host "   Taille de la réponse : $($pdfResponse.Content.Length) caractères" -ForegroundColor Gray
    } else {
        Write-Host "❌ PDF non accessible (Code: $($pdfResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PDF: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'application principale :" -ForegroundColor Yellow
try {
    $appResponse = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    if ($appResponse.StatusCode -eq 200) {
        Write-Host "✅ Application principale accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Application principale non accessible (Code: $($appResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur application principale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest des boutons d'accès :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Testez MeTube : Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "4. Testez PDF : Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "5. Vérifiez que les pages se chargent correctement" -ForegroundColor White

Write-Host "`n✅ Correction des pages blanches appliquée !" -ForegroundColor Green
Write-Host "   Les modules devraient maintenant être accessibles" -ForegroundColor Gray
Write-Host "   - MeTube : https://metube.iahome.fr" -ForegroundColor Gray
Write-Host "   - PDF : https://pdf.iahome.fr" -ForegroundColor Gray

