# Script pour tester l'application en production sur iahome.fr
Write-Host "Test de l'application en production sur iahome.fr..." -ForegroundColor Green

# Test de l'API de santé
Write-Host "`n1. Test de l'API de santé..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API de santé accessible" -ForegroundColor Green
        $healthData = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($healthData.status)" -ForegroundColor Cyan
        Write-Host "   Environment: $($healthData.environment)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ API accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur API de santé: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la page d'accueil
Write-Host "`n2. Test de la page d'accueil..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page d'accueil accessible" -ForegroundColor Green
        Write-Host "   Taille: $($response.Content.Length) caractères" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page d'accueil: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API de création de paiement
Write-Host "`n3. Test de l'API create-payment-intent..." -ForegroundColor Yellow

$testData = @{
    items = @(
        @{
            id = "1"
            title = "Test Module Production"
            price = 9.99
            description = "Module de test en production"
        }
    )
    customerEmail = "test@iahome.fr"
    type = "payment"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/create-payment-intent" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ API de paiement accessible" -ForegroundColor Green
    Write-Host "   Session ID: $($response.sessionId)" -ForegroundColor Cyan
    Write-Host "   URL Stripe: $($response.url)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur API de paiement: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la page de transition
Write-Host "`n4. Test de la page de transition..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/stripe-return" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page de transition accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page de transition: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la page de validation
Write-Host "`n5. Test de la page de validation..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/validation" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page de validation accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page de validation: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de la page des modules
Write-Host "`n6. Test de la page des modules..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/modules" -Method GET
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page des modules accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur page des modules: $($_.Exception.Message)" -ForegroundColor Red
}

# Test SSL
Write-Host "`n7. Test SSL..." -ForegroundColor Yellow

try {
    $request = [System.Net.WebRequest]::Create("https://iahome.fr")
    $request.Method = "HEAD"
    $response = $request.GetResponse()
    $response.Close()
    Write-Host "✅ SSL fonctionne correctement" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur SSL: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de production termine !" -ForegroundColor Green
Write-Host "L'application est maintenant accessible sur https://iahome.fr" -ForegroundColor Cyan






