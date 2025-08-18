# Script pour tester l'activation des modules après paiement
Write-Host "Test de l'activation des modules après paiement..." -ForegroundColor Green

# Test de l'API de création de paiement avec un module réel
Write-Host "`n1. Création d'une session de paiement pour le module ruinedfooocus..." -ForegroundColor Yellow

$testData = @{
    items = @(
        @{
            id = "ruinedfooocus"
            title = "RuinedFooocus - Génération d'images IA"
            price = 9.99
            description = "Module de génération d'images avec Stable Diffusion"
        }
    )
    customerEmail = "test@iahome.fr"
    type = "payment"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/create-payment-intent" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Session de paiement créée avec succès" -ForegroundColor Green
    Write-Host "   Session ID: $($response.sessionId)" -ForegroundColor Cyan
    Write-Host "   URL Stripe: $($response.url)" -ForegroundColor Cyan
    
    # Instructions pour tester manuellement
    Write-Host "`n2. Instructions pour tester l'activation du module:" -ForegroundColor Yellow
    Write-Host "   1. Ouvrez cette URL dans votre navigateur:" -ForegroundColor White
    Write-Host "      $($response.url)" -ForegroundColor Cyan
    Write-Host "   2. Utilisez une carte de test Stripe:" -ForegroundColor White
    Write-Host "      Numéro: 4242 4242 4242 4242" -ForegroundColor Cyan
    Write-Host "      Date: 12/25" -ForegroundColor Cyan
    Write-Host "      CVC: 123" -ForegroundColor Cyan
    Write-Host "   3. Complétez le paiement" -ForegroundColor White
    Write-Host "   4. Vérifiez que vous êtes redirigé vers https://iahome.fr/stripe-return" -ForegroundColor White
    Write-Host "   5. Vérifiez que le module apparaît dans https://iahome.fr/encours" -ForegroundColor White
    
    Write-Host "`n3. Vérification des logs du webhook..." -ForegroundColor Yellow
    Write-Host "   Après le paiement, vérifiez les logs pour voir si le webhook Stripe a été appelé" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur lors de la création de la session: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest d'activation de module termine !" -ForegroundColor Green
Write-Host "Vérifiez que le module apparaît bien dans /encours après le paiement" -ForegroundColor Cyan






