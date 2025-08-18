# Script pour tester le processus complet avec un vrai paiement
Write-Host "Test du processus complet avec un vrai paiement..." -ForegroundColor Green

# Test de l'API de création de paiement
Write-Host "`n1. Création d'une session de paiement..." -ForegroundColor Yellow

$testData = @{
    items = @(
        @{
            id = "ruinedfooocus"
            title = "RuinedFooocus - Génération d'images IA"
            price = 9.99
            description = "Module de génération d'images avec Stable Diffusion"
        }
    )
    customerEmail = "test@example.com"
    type = "payment"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/create-payment-intent" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Session de paiement créée avec succès" -ForegroundColor Green
    Write-Host "   Session ID: $($response.sessionId)" -ForegroundColor Cyan
    Write-Host "   URL Stripe: $($response.url)" -ForegroundColor Cyan
    
    # Instructions pour tester manuellement
    Write-Host "`n2. Instructions pour tester le processus complet:" -ForegroundColor Yellow
    Write-Host "   1. Créez d'abord un compte utilisateur sur https://iahome.fr" -ForegroundColor White
    Write-Host "   2. Connectez-vous avec votre compte" -ForegroundColor White
    Write-Host "   3. Ouvrez cette URL de paiement:" -ForegroundColor White
    Write-Host "      $($response.url)" -ForegroundColor Cyan
    Write-Host "   4. Utilisez une carte de test Stripe:" -ForegroundColor White
    Write-Host "      Numéro: 4242 4242 4242 4242" -ForegroundColor Cyan
    Write-Host "      Date: 12/25" -ForegroundColor Cyan
    Write-Host "      CVC: 123" -ForegroundColor Cyan
    Write-Host "   5. Complétez le paiement" -ForegroundColor White
    Write-Host "   6. Vérifiez que vous êtes redirigé vers https://iahome.fr/stripe-return" -ForegroundColor White
    Write-Host "   7. Vérifiez que le module apparaît dans https://iahome.fr/encours" -ForegroundColor White
    
    Write-Host "`n3. Vérification des logs..." -ForegroundColor Yellow
    Write-Host "   Après le paiement, vérifiez les logs pour voir si le webhook Stripe a été appelé" -ForegroundColor White
    Write-Host "   et si l'utilisateur a été créé et le module activé" -ForegroundColor White
    
} catch {
    Write-Host "❌ Erreur lors de la création de la session: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest du processus complet termine !" -ForegroundColor Green
Write-Host "Suivez les instructions pour tester le processus complet" -ForegroundColor Cyan






