# Test simple du workflow Stripe
Write-Host "Test du workflow Stripe..." -ForegroundColor Green

$paymentData = @{
    items = @(
        @{
            id = "13"
            title = "RuinedFooocus"
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
        Write-Host "Session Stripe creee!" -ForegroundColor Green
        Write-Host "URL: $($sessionResponse.url)" -ForegroundColor White
        Write-Host "Testez le paiement avec cette URL" -ForegroundColor Yellow
    } else {
        Write-Host "Erreur: $($sessionResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test termine!" -ForegroundColor Green






