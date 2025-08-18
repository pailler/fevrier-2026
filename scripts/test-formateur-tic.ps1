# Test avec l'utilisateur formateur_tic@hotmail.com
Write-Host "Test avec l'utilisateur formateur_tic@hotmail.com..." -ForegroundColor Green

$testEmail = "formateur_tic@hotmail.com"

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
        Write-Host "   Paiements: $($response.summary.totalPayments)" -ForegroundColor White
        Write-Host "   Applications: $($response.summary.totalApplications)" -ForegroundColor White
        Write-Host "   Tokens: $($response.summary.totalTokens)" -ForegroundColor White
        
        if ($response.userApplications) {
            Write-Host "   Modules actuellement actives:" -ForegroundColor Yellow
            foreach ($app in $response.userApplications) {
                Write-Host "     - $($app.module_title) (ID: $($app.module_id))" -ForegroundColor White
            }
        }
        
        # Test de l'activation avec cet utilisateur
        Write-Host "`nTest de l'activation du module ruinedfooocus..." -ForegroundColor Yellow
        
        $activationData = @{
            userEmail = $testEmail
            moduleId = "13"
            moduleTitle = "RuinedFooocus - Generation d'images IA"
        } | ConvertTo-Json
        
        $activationResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/force-activate-module" -Method POST -Body $activationData -ContentType "application/json"
        
        if ($activationResponse.success) {
            Write-Host "✅ Module active avec succes!" -ForegroundColor Green
            Write-Host "   Access ID: $($activationResponse.accessId)" -ForegroundColor White
            Write-Host "   Token ID: $($activationResponse.tokenId)" -ForegroundColor White
            Write-Host "   Expires At: $($activationResponse.expiresAt)" -ForegroundColor White
            
            # Vérifier que le module apparaît maintenant
            Write-Host "`nVerification que le module apparaît dans /encours..." -ForegroundColor Yellow
            Write-Host "   Allez sur https://iahome.fr/encours pour vérifier" -ForegroundColor Cyan
            Write-Host "   Le module RuinedFooocus devrait maintenant apparaître" -ForegroundColor Cyan
            
        } else {
            Write-Host "❌ Erreur activation: $($activationResponse.error)" -ForegroundColor Red
        }
        
    } else {
        Write-Host "❌ Utilisateur non trouve" -ForegroundColor Red
        Write-Host "   Erreur: $($response.error)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green
