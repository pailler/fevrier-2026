# Test du workflow complet pour tous les modules
Write-Host "Test du workflow complet pour tous les modules..." -ForegroundColor Green

$testEmail = "formateur_tic@hotmail.com"

Write-Host "Test avec l'email: $testEmail" -ForegroundColor Yellow

# 1. Vérifier l'état actuel de l'utilisateur
Write-Host "`n1. Verification de l'etat actuel..." -ForegroundColor Cyan
try {
    $testData = @{
        userEmail = $testEmail
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/debug-payment" -Method POST -Body $testData -ContentType "application/json"
    
    if ($response.success) {
        Write-Host "✅ Utilisateur trouve!" -ForegroundColor Green
        Write-Host "   ID: $($response.user.id)" -ForegroundColor White
        Write-Host "   Applications: $($response.summary.totalApplications)" -ForegroundColor White
        Write-Host "   Tokens: $($response.summary.totalTokens)" -ForegroundColor White
        
        if ($response.userApplications) {
            Write-Host "   Modules actuellement actives:" -ForegroundColor Yellow
            foreach ($app in $response.userApplications) {
                Write-Host "     - Module ID: $($app.module_id)" -ForegroundColor White
            }
        }
    }
} catch {
    Write-Host "❌ Erreur verification etat: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Récupérer la liste des modules disponibles
Write-Host "`n2. Recuperation des modules disponibles..." -ForegroundColor Cyan
try {
    $modulesResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/check-modules" -Method GET
    
    if ($modulesResponse.success) {
        Write-Host "✅ Modules disponibles: $($modulesResponse.summary.totalModules)" -ForegroundColor Green
        
        # 3. Tester l'activation de quelques modules différents
        $testModules = @(
            @{ id = "41"; title = "ChatGPT" },
            @{ id = "44"; title = "DALL-E" },
            @{ id = "43"; title = "Midjourney" }
        )
        
        Write-Host "`n3. Test d'activation de modules supplementaires..." -ForegroundColor Cyan
        
        foreach ($module in $testModules) {
            Write-Host "`nTest activation: $($module.title) (ID: $($module.id))" -ForegroundColor Yellow
            
            $activationData = @{
                userEmail = $testEmail
                moduleId = $module.id
                moduleTitle = $module.title
            } | ConvertTo-Json
            
            try {
                $activationResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/force-activate-module" -Method POST -Body $activationData -ContentType "application/json"
                
                if ($activationResponse.success) {
                    Write-Host "   ✅ Module active: $($module.title)" -ForegroundColor Green
                    Write-Host "   Access ID: $($activationResponse.accessId)" -ForegroundColor White
                } else {
                    Write-Host "   ❌ Erreur activation: $($activationResponse.error)" -ForegroundColor Red
                }
            } catch {
                Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        # 4. Vérifier l'état final
        Write-Host "`n4. Verification de l'etat final..." -ForegroundColor Cyan
        $finalResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/debug-payment" -Method POST -Body $testData -ContentType "application/json"
        
        if ($finalResponse.success) {
            Write-Host "✅ Etat final:" -ForegroundColor Green
            Write-Host "   Applications: $($finalResponse.summary.totalApplications)" -ForegroundColor White
            Write-Host "   Tokens: $($finalResponse.summary.totalTokens)" -ForegroundColor White
            
            if ($finalResponse.userApplications) {
                Write-Host "   Modules actives:" -ForegroundColor Yellow
                foreach ($app in $finalResponse.userApplications) {
                    Write-Host "     - Module ID: $($app.module_id)" -ForegroundColor White
                }
            }
        }
        
    } else {
        Write-Host "❌ Erreur recuperation modules: $($modulesResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest du workflow termine!" -ForegroundColor Green
Write-Host "Allez sur https://iahome.fr/encours pour verifier visuellement" -ForegroundColor Cyan






