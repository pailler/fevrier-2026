# Script pour forcer l'activation d'un module pour tester le processus
Write-Host "Test de l'activation forcée d'un module..." -ForegroundColor Green

# Test de l'API de force activation
Write-Host "`n1. Test de l'API de force activation..." -ForegroundColor Yellow

$testData = @{
    userEmail = "test@iahome.fr"
    moduleId = "ruinedfooocus"
    moduleTitle = "RuinedFooocus - Génération d'images IA"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/force-activate-module" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Module activé avec succès" -ForegroundColor Green
    Write-Host "   Module ID: $($response.accessId)" -ForegroundColor Cyan
    Write-Host "   Token ID: $($response.tokenId)" -ForegroundColor Cyan
    Write-Host "   Expires At: $($response.expiresAt)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de l'activation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest d'activation forcée termine !" -ForegroundColor Green
Write-Host "Vérifiez que le module apparaît dans /encours" -ForegroundColor Cyan
