# Test direct de l'activation avec un utilisateur connu
Write-Host "Test direct de l'activation..." -ForegroundColor Green

# Test avec un email d'utilisateur existant
$testEmail = "admin@iahome.fr"

Write-Host "Test avec l'email: $testEmail" -ForegroundColor Yellow

# Test de l'API de debug
try {
    $testData = @{
        userEmail = $testEmail
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/debug-payment" -Method POST -Body $testData -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Utilisateur trouve!" -ForegroundColor Green
        Write-Host "   ID: $($response.user.id)" -ForegroundColor White
        Write-Host "   Email: $($response.user.email)" -ForegroundColor White
        
        # Test de l'activation avec cet utilisateur
        Write-Host "`nTest de l'activation du module..." -ForegroundColor Yellow
        
        $activationData = @{
            userEmail = $testEmail
            moduleId = "ruinedfooocus"
            moduleTitle = "RuinedFooocus - Generation d'images IA"
        } | ConvertTo-Json
        
        $activationResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/force-activate-module" -Method POST -Body $activationData -ContentType "application/json"
        
        if ($activationResponse.success) {
            Write-Host "✅ Module active avec succes!" -ForegroundColor Green
            Write-Host "   Access ID: $($activationResponse.accessId)" -ForegroundColor White
            Write-Host "   Token ID: $($activationResponse.tokenId)" -ForegroundColor White
        } else {
            Write-Host "❌ Erreur activation: $($activationResponse.error)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Utilisateur non trouve" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green






