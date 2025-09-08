# Test de debug de l'API generate-standard-token
Write-Host "Test de debug de l'API generate-standard-token" -ForegroundColor Cyan

Write-Host "`nTest de l'API health :" -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -Method GET -TimeoutSec 10
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "✅ API health accessible" -ForegroundColor Green
        Write-Host "   Réponse: $($healthResponse.Content)" -ForegroundColor Gray
    } else {
        Write-Host "❌ API health non accessible (Code: $($healthResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API health: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'API version :" -ForegroundColor Yellow
try {
    $versionResponse = Invoke-WebRequest -Uri "https://iahome.fr/api/version" -Method GET -TimeoutSec 10
    if ($versionResponse.StatusCode -eq 200) {
        Write-Host "✅ API version accessible" -ForegroundColor Green
        Write-Host "   Réponse: $($versionResponse.Content)" -ForegroundColor Gray
    } else {
        Write-Host "❌ API version non accessible (Code: $($versionResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API version: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'API generate-standard-token avec debug :" -ForegroundColor Yellow
try {
    $body = @{
        moduleName = "QR Codes"
        moduleId = "qrcodes"
        userId = "test-user-123"
    } | ConvertTo-Json

    Write-Host "   Envoi de la requête..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-standard-token" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Headers: $($response.Headers)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API generate-standard-token fonctionne" -ForegroundColor Green
    } else {
        Write-Host "❌ API generate-standard-token retourne une erreur" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test de l'API: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        Write-Host "   Response: $($_.Exception.Response)" -ForegroundColor Gray
    }
}

Write-Host "`nTest de l'API avec un module existant :" -ForegroundColor Yellow
try {
    $body = @{
        moduleName = "LibreSpeed"
        moduleId = "librespeed"
        userId = "test-user-123"
    } | ConvertTo-Json

    Write-Host "   Test avec LibreSpeed..." -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-standard-token" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API fonctionne avec LibreSpeed" -ForegroundColor Green
    } else {
        Write-Host "❌ API ne fonctionne pas avec LibreSpeed" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur avec LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
}

