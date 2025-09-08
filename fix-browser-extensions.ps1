# Script pour resoudre les problemes d'extensions de navigateur avec MeTube
Write-Host "Resolution des problemes d'extensions de navigateur" -ForegroundColor Cyan

Write-Host "`nSolutions pour l'erreur d'extension FIDO2 :" -ForegroundColor Yellow

Write-Host "`n1. Diagnostic de l'erreur :" -ForegroundColor White
Write-Host "   L'erreur moz-extension indique qu'une extension de navigateur" -ForegroundColor Gray
Write-Host "   (probablement d'authentification) tente de s'executer sur MeTube." -ForegroundColor Gray

Write-Host "`n2. Configuration Traefik mise a jour :" -ForegroundColor Green
Write-Host "   - Headers CSP mis a jour pour autoriser les extensions" -ForegroundColor Gray
Write-Host "   - Support des extensions Mozilla et Chrome" -ForegroundColor Gray
Write-Host "   - Traefik redemarre avec la nouvelle configuration" -ForegroundColor Gray

Write-Host "`n3. Solutions cote navigateur :" -ForegroundColor Yellow

Write-Host "`n   Option A - Desactiver temporairement l'extension :" -ForegroundColor White
Write-Host "   - Ouvrez Firefox/Chrome" -ForegroundColor Gray
Write-Host "   - Allez dans les extensions (about:addons pour Firefox)" -ForegroundColor Gray
Write-Host "   - Desactivez temporairement l'extension d'authentification" -ForegroundColor Gray
Write-Host "   - Rechargez la page MeTube" -ForegroundColor Gray

Write-Host "`n   Option B - Ajouter une exception pour le domaine :" -ForegroundColor White
Write-Host "   - Dans les parametres de l'extension" -ForegroundColor Gray
Write-Host "   - Ajoutez metube.iahome.fr aux exceptions" -ForegroundColor Gray
Write-Host "   - Ou desactivez l'extension pour ce domaine" -ForegroundColor Gray

Write-Host "`n   Option C - Mode navigation privee :" -ForegroundColor White
Write-Host "   - Ouvrez une fenetre de navigation privee" -ForegroundColor Gray
Write-Host "   - Accedez a https://metube.iahome.fr" -ForegroundColor Gray
Write-Host "   - Les extensions sont generalement desactivees en mode prive" -ForegroundColor Gray

Write-Host "`n4. Test de la configuration :" -ForegroundColor Yellow
Write-Host "   - URL: https://metube.iahome.fr" -ForegroundColor White
Write-Host "   - Verifiez que MeTube se charge correctement" -ForegroundColor White
Write-Host "   - L'erreur d'extension ne devrait plus apparaître" -ForegroundColor White

Write-Host "`n5. Verification des headers de securite :" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method HEAD -TimeoutSec 10
    $cspHeader = $response.Headers['Content-Security-Policy']
    if ($cspHeader -like "*moz-extension*") {
        Write-Host "Headers CSP mis a jour avec support des extensions" -ForegroundColor Green
    } else {
        Write-Host "Headers CSP non detectes ou non mis a jour" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Impossible de verifier les headers (verifiez que le DNS est configure)" -ForegroundColor Red
}

Write-Host "`n6. Si le probleme persiste :" -ForegroundColor Yellow
Write-Host "   - Videz le cache du navigateur (Ctrl+F5)" -ForegroundColor White
Write-Host "   - Redemarrez le navigateur" -ForegroundColor White
Write-Host "   - Testez avec un autre navigateur" -ForegroundColor White
Write-Host "   - Verifiez la console developpeur (F12) pour d'autres erreurs" -ForegroundColor White

Write-Host "`nConfiguration mise a jour !" -ForegroundColor Green
Write-Host "   L'erreur d'extension ne devrait plus affecter le fonctionnement de MeTube." -ForegroundColor Gray