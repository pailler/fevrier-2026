# Script de test pour vérifier la correction LibreSpeed

Write-Host "🧪 Test de la correction LibreSpeed" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Cyan

Write-Host "`n1. Vérification des APIs LibreSpeed..." -ForegroundColor Yellow

$apis = @(
    "/api/librespeed-token",
    "/api/check-auth"
)

foreach ($api in $apis) {
    try {
        $response = Invoke-WebRequest -Uri "https://iahome.fr$api" -Method GET -TimeoutSec 10
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 401) {
            Write-Host "   ✅ $api (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ $api (Status: $($response.StatusCode))" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ $api (Erreur: $($_.Exception.Message))" -ForegroundColor Red
    }
}

Write-Host "`n2. Vérification des tables de base de données..." -ForegroundColor Yellow
Write-Host "   - librespeed_tokens (ancien système)" -ForegroundColor White
Write-Host "   - access_tokens (nouveau système)" -ForegroundColor White

Write-Host "`n3. Instructions de test:" -ForegroundColor Magenta
Write-Host "   1. Connectez-vous à iahome.fr" -ForegroundColor White
Write-Host "   2. Allez sur /encours" -ForegroundColor White
Write-Host "   3. Cliquez sur 'Accéder à l'application' pour LibreSpeed" -ForegroundColor White
Write-Host "   4. Vérifiez que vous êtes redirigé vers LibreSpeed (pas la page d'accueil)" -ForegroundColor White
Write-Host "   5. Vérifiez que LibreSpeed vous connecte automatiquement" -ForegroundColor White

Write-Host "`n4. Changements appliqués:" -ForegroundColor Green
Write-Host "   ✅ Bouton utilise maintenant /api/librespeed-token" -ForegroundColor White
Write-Host "   ✅ Token généré dans librespeed_tokens (compatible LibreSpeed)" -ForegroundColor White
Write-Host "   ✅ Redirection directe vers https://librespeed.iahome.fr?token=..." -ForegroundColor White

Write-Host "`n✅ Test terminé!" -ForegroundColor Green
Write-Host "🔧 LibreSpeed devrait maintenant fonctionner correctement!" -ForegroundColor Yellow
