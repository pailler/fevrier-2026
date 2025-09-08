# Test simple de l'API generate-standard-token
Write-Host "Test simple de l'API generate-standard-token" -ForegroundColor Cyan

Write-Host "`nTest de l'API avec un utilisateur fictif :" -ForegroundColor Yellow
try {
    $body = @{
        moduleName = "QR Codes"
        moduleId = "qrcodes"
        userId = "test-user-123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-standard-token" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API fonctionne correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ API retourne une erreur" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test de l'API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'API avec un utilisateur vide :" -ForegroundColor Yellow
try {
    $body = @{
        moduleName = "QR Codes"
        moduleId = "qrcodes"
        userId = ""
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-standard-token" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    
    if ($response.StatusCode -eq 400) {
        Write-Host "✅ API gère correctement les utilisateurs vides" -ForegroundColor Green
    } else {
        Write-Host "❌ API ne gère pas correctement les utilisateurs vides" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test avec utilisateur vide: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de l'API sans moduleId :" -ForegroundColor Yellow
try {
    $body = @{
        moduleName = "QR Codes"
        userId = "test-user-123"
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/generate-standard-token" -Method POST -ContentType "application/json" -Body $body -TimeoutSec 10
    
    Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API fonctionne avec moduleName seulement" -ForegroundColor Green
    } else {
        Write-Host "❌ API ne fonctionne pas avec moduleName seulement" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test avec moduleName seulement: $($_.Exception.Message)" -ForegroundColor Red
}

