# Script pour tester les URLs de redirection Stripe
Write-Host "Test des URLs de redirection Stripe..." -ForegroundColor Green

# Test de l'API de création de paiement
Write-Host "`n1. Test de l'API create-payment-intent..." -ForegroundColor Yellow

$testData = @{
    items = @(
        @{
            id = "1"
            title = "Test Module"
            price = 9.99
            description = "Module de test"
        }
    )
    customerEmail = "test@iahome.fr"
    type = "payment"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/create-payment-intent" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ API accessible" -ForegroundColor Green
    Write-Host "Session ID: $($response.sessionId)" -ForegroundColor Cyan
    Write-Host "URL: $($response.url)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la page de transition
Write-Host "`n2. Test de la page de transition..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/stripe-return" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page de transition accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page de transition: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la page de validation
Write-Host "`n3. Test de la page de validation..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/validation" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page de validation accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page de validation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine !" -ForegroundColor Green






