# Test avec plusieurs emails d'utilisateurs possibles
Write-Host "Test avec plusieurs emails d'utilisateurs..." -ForegroundColor Green

$testEmails = @(
    "admin@iahome.fr",
    "test@iahome.fr",
    "user@iahome.fr",
    "admin@example.com",
    "test@example.com",
    "user@example.com",
    "admin@test.com",
    "test@test.com",
    "user@test.com"
)

foreach ($email in $testEmails) {
    Write-Host "`nTest avec: $email" -ForegroundColor Cyan
    
    try {
        $testData = @{
            userEmail = $email
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "https://iahome.fr/api/debug-payment" -Method POST -Body $testData -ContentType "application/json"
        
        if ($response.success) {
            Write-Host "✅ UTILISATEUR TROUVE!" -ForegroundColor Green
            Write-Host "   ID: $($response.user.id)" -ForegroundColor White
            Write-Host "   Email: $($response.user.email)" -ForegroundColor White
            Write-Host "   Applications: $($response.summary.totalApplications)" -ForegroundColor White
            Write-Host "   Tokens: $($response.summary.totalTokens)" -ForegroundColor White
            
            # Test de l'activation avec cet utilisateur
            Write-Host "   Test de l'activation..." -ForegroundColor Yellow
            
            $activationData = @{
                userEmail = $email
                moduleId = "ruinedfooocus"
                moduleTitle = "RuinedFooocus - Generation d'images IA"
            } | ConvertTo-Json
            
            $activationResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/force-activate-module" -Method POST -Body $activationData -ContentType "application/json"
            
            if ($activationResponse.success) {
                Write-Host "   ✅ MODULE ACTIVE!" -ForegroundColor Green
                Write-Host "   Access ID: $($activationResponse.accessId)" -ForegroundColor White
                Write-Host "   Token ID: $($activationResponse.tokenId)" -ForegroundColor White
                break
            } else {
                Write-Host "   ❌ Erreur activation: $($activationResponse.error)" -ForegroundColor Red
            }
            
        } else {
            Write-Host "❌ Utilisateur non trouve" -ForegroundColor Red
        }
        
    } catch {
        Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nTest termine!" -ForegroundColor Green






