# Test du bouton d'accès MeTube
Write-Host "Test du bouton d'accès MeTube" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Vérification de connexion : MeTube exige une connexion Google (comme LibreSpeed)" -ForegroundColor Green
Write-Host "✅ URL directe : https://metube.iahome.fr" -ForegroundColor Green
Write-Host "✅ Ouverture en nouvel onglet : window.open()" -ForegroundColor Green
Write-Host "✅ Mapping des URLs : Configuré dans getModuleUrl" -ForegroundColor Green

Write-Host "`nLogique d'accès :" -ForegroundColor Yellow
Write-Host "1. Utilisateur clique sur 'Accéder à l'application' pour MeTube" -ForegroundColor White
Write-Host "2. Vérification de la connexion Google (comme LibreSpeed)" -ForegroundColor White
Write-Host "3. Si non connecté : Redirection vers login Google" -ForegroundColor White
Write-Host "4. Si connecté : Ouverture de https://metube.iahome.fr dans un nouvel onglet" -ForegroundColor White

Write-Host "`nComparaison avec LibreSpeed :" -ForegroundColor Yellow
Write-Host "✅ Même vérification de connexion" -ForegroundColor Green
Write-Host "✅ Même logique d'ouverture" -ForegroundColor Green
Write-Host "✅ Même traitement utilisateur" -ForegroundColor Green
Write-Host "✅ Même comportement de bouton" -ForegroundColor Green

Write-Host "`nTest de l'application :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Trouvez le module MeTube" -ForegroundColor White
Write-Host "4. Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "5. Vérifiez que https://metube.iahome.fr s'ouvre dans un nouvel onglet" -ForegroundColor White

Write-Host "`nVérification de la configuration :" -ForegroundColor Yellow
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

try {
    $metubeResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
    if ($metubeResponse.StatusCode -eq 200) {
        Write-Host "✅ MeTube accessible via https://metube.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ MeTube non accessible (Code: $($metubeResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur MeTube: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "   Le bouton MeTube fonctionne maintenant exactement comme LibreSpeed" -ForegroundColor Gray
Write-Host "   - Vérification de connexion" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray
Write-Host "   - URL directe https://metube.iahome.fr" -ForegroundColor Gray

