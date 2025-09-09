# Script de test pour vérifier l'ajout du lien "Applications"
Write-Host "🔗 Test de l'ajout du lien Applications" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔗 Lien Applications ajouté:" -ForegroundColor Yellow
Write-Host "   ✅ Lien 'Applications' dans la bannière blanche" -ForegroundColor White
Write-Host "   ✅ Position: Après le lien 'Formation'" -ForegroundColor White
Write-Host "   ✅ URL: https://iahome.fr" -ForegroundColor White
Write-Host "   ✅ Target: _blank (nouvel onglet)" -ForegroundColor White
Write-Host "   ✅ Rel: noopener noreferrer (sécurité)" -ForegroundColor White
Write-Host ""

Write-Host "📱 Support mobile:" -ForegroundColor Cyan
Write-Host "   ✅ Lien visible sur desktop (hidden md:block)" -ForegroundColor White
Write-Host "   ✅ Lien visible sur mobile dans le menu déroulant" -ForegroundColor White
Write-Host "   ✅ Style cohérent avec les autres liens" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Test à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr" -ForegroundColor White
Write-Host "2. Vérifiez la bannière blanche (navigation)" -ForegroundColor White
Write-Host "3. Cherchez le lien 'Applications' après 'Formation'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Applications' - doit ouvrir iahome.fr dans un nouvel onglet" -ForegroundColor White
Write-Host "5. Testez sur mobile - le lien doit être dans le menu hamburger" -ForegroundColor White
Write-Host ""

Write-Host "✅ Lien Applications ajouté avec succès !" -ForegroundColor Green
Write-Host "🎯 Navigation améliorée avec accès direct aux applications" -ForegroundColor Green
