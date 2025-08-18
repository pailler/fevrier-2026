# Script pour vérifier la configuration du webhook Stripe
Write-Host "Vérification de la configuration du webhook Stripe..." -ForegroundColor Green

# Test de l'endpoint webhook
Write-Host "`n1. Test de l'endpoint webhook..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/webhooks/stripe" -Method POST -Body "{}" -ContentType "application/json"
    Write-Host "✅ Endpoint webhook accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur endpoint webhook: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API de santé
Write-Host "`n2. Test de l'API de santé..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/health" -Method GET
    Write-Host "✅ API de santé accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.status)" -ForegroundColor Cyan
    Write-Host "   Environment: $($response.environment)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur API de santé: $($_.Exception.Message)" -ForegroundColor Red
}

# Vérification des variables d'environnement
Write-Host "`n3. Vérification des variables d'environnement..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/health" -Method GET
    if ($response.services) {
        Write-Host "✅ Services configurés:" -ForegroundColor Green
        foreach ($service in $response.services.PSObject.Properties) {
            Write-Host "   $($service.Name): $($service.Value.status)" -ForegroundColor Cyan
        }
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification des services: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nVérification termine !" -ForegroundColor Green
Write-Host "Assurez-vous que le webhook Stripe est configuré pour pointer vers:" -ForegroundColor Cyan
Write-Host "https://iahome.fr/api/webhooks/stripe" -ForegroundColor White






