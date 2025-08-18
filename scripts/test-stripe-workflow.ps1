# Test du workflow Stripe complet
Write-Host "Test du workflow Stripe complet..." -ForegroundColor Green

# 1. Créer une session de paiement Stripe
Write-Host "`n1. Creation d'une session de paiement Stripe..." -ForegroundColor Cyan

$paymentData = @{
    items = @(
        @{
            id = "13"
            title = "RuinedFooocus - Generation d'images IA"
            price = 990
            quantity = 1
        }
    )
    customerEmail = "formateur_tic@hotmail.com"
    successUrl = "https://iahome.fr/stripe-return?session_id={CHECKOUT_SESSION_ID}"
    cancelUrl = "https://iahome.fr/stripe-return?canceled=true"
} | ConvertTo-Json

try {
    $sessionResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/create-payment-intent" -Method POST -Body $paymentData -ContentType "application/json"
    
    if ($sessionResponse.success) {
        Write-Host "✅ Session Stripe creee!" -ForegroundColor Green
        Write-Host "   Session ID: $($sessionResponse.sessionId)" -ForegroundColor White
        Write-Host "   URL de paiement: $($sessionResponse.url)" -ForegroundColor White
        
        Write-Host "`n📋 Instructions pour tester le paiement:" -ForegroundColor Yellow
        Write-Host "1. Ouvrez cette URL dans votre navigateur:" -ForegroundColor White
        Write-Host "   $($sessionResponse.url)" -ForegroundColor Cyan
        Write-Host "2. Completez le paiement avec une carte de test Stripe" -ForegroundColor White
        Write-Host "   Numero: 4242 4242 4242 4242" -ForegroundColor White
        Write-Host "   Date: Date future quelconque" -ForegroundColor White
        Write-Host "   CVC: 123" -ForegroundColor White
        Write-Host "3. Apres paiement, vous devriez etre redirige vers la page de transition" -ForegroundColor White
        Write-Host "4. Le module devrait apparaître dans /encours" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erreur creation session: $($sessionResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest du workflow Stripe termine!" -ForegroundColor Green






