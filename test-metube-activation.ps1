# Script de test pour l'activation MeTube
Write-Host "🧪 Test de l'activation MeTube" -ForegroundColor Cyan

# Test 1: Vérifier que l'application est accessible
Write-Host "`n1. Test de l'accessibilité de l'application..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Application non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier la page MeTube
Write-Host "`n2. Test de la page MeTube..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/card/metube" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page MeTube accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page MeTube non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier la page de transition
Write-Host "`n3. Test de la page de transition..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/token-generated?module=MeTube" -Method GET -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page de transition accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page de transition non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur de connexion: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier l'API de génération de token
Write-Host "`n4. Test de l'API de génération de token..." -ForegroundColor Yellow
try {
    $body = @{
        moduleName = "MeTube"
        moduleId = "metube"
        userId = "test-user-id"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-premium-token" -Method POST -Body $body -ContentType "application/json" -TimeoutSec 10
    Write-Host "✅ API accessible (Code: $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Réponse: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Gray
    }
}

Write-Host "`n🎯 Instructions de test manuel:" -ForegroundColor Cyan
Write-Host "1. Allez sur https://iahome.fr/card/metube" -ForegroundColor White
Write-Host "2. Connectez-vous à votre compte" -ForegroundColor White
Write-Host "3. Cliquez sur 'Activer l'application MeTube'" -ForegroundColor White
Write-Host "4. Vérifiez que vous êtes redirigé vers /token-generated?module=MeTube" -ForegroundColor White
Write-Host "5. Vérifiez que le module MeTube apparaît sur /encours" -ForegroundColor White

Write-Host "`n✅ Test terminé" -ForegroundColor Green

