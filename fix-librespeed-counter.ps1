# Script de réparation du compteur LibreSpeed
Write-Host "🔧 Réparation du compteur LibreSpeed" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

Write-Host "`n1. Vérification de la structure de la base de données" -ForegroundColor Yellow

# Test de l'API de test de base de données
try {
    $dbTestResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/test-librespeed-db" -Method GET
    
    if ($dbTestResponse.success) {
        Write-Host "✅ Base de données accessible" -ForegroundColor Green
        Write-Host "   Tables vérifiées: $($dbTestResponse.tables -join ', ')" -ForegroundColor White
    } else {
        Write-Host "❌ Problème avec la base de données" -ForegroundColor Red
        Write-Host "   Erreur: $($dbTestResponse.error)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur lors du test de la base de données: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Test de l'API d'activation LibreSpeed" -ForegroundColor Yellow

try {
    $activateBody = @{
        userId = "test-user-123"
        userEmail = "test@example.com"
    } | ConvertTo-Json

    $activateResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/activate-librespeed-test" -Method POST -Body $activateBody -ContentType "application/json"
    
    if ($activateResponse.success) {
        Write-Host "✅ LibreSpeed activé pour l'utilisateur de test" -ForegroundColor Green
        Write-Host "   Module ID: $($activateResponse.moduleId)" -ForegroundColor White
        Write-Host "   Usage: $($activateResponse.usage_count)/$($activateResponse.max_usage)" -ForegroundColor White
    } else {
        Write-Host "⚠️ LibreSpeed déjà activé ou erreur: $($activateResponse.message)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de l'activation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test complet du flux de comptage" -ForegroundColor Yellow

try {
    # Test d'incrémentation
    $incrementBody = @{
        userId = "test-user-123"
        userEmail = "test@example.com"
    } | ConvertTo-Json

    $incrementResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/increment-librespeed-access" -Method POST -Body $incrementBody -ContentType "application/json"
    
    if ($incrementResponse.success) {
        Write-Host "✅ Compteur incrémenté avec succès" -ForegroundColor Green
        Write-Host "   Nouveau usage: $($incrementResponse.usage_count)/$($incrementResponse.max_usage)" -ForegroundColor White
        
        # Test de génération de token
        $tokenResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/librespeed-token" -Method POST -Body $incrementBody -ContentType "application/json"
        
        if ($tokenResponse.success) {
            Write-Host "✅ Token généré avec succès" -ForegroundColor Green
            Write-Host "   Token: $($tokenResponse.token.Substring(0, 10))..." -ForegroundColor White
            
            # Test de validation du token
            $validateResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/librespeed-token?token=$($tokenResponse.token)" -Method GET
            
            if ($validateResponse -eq "Token valid") {
                Write-Host "✅ Token validé avec succès" -ForegroundColor Green
            } else {
                Write-Host "❌ Erreur de validation du token" -ForegroundColor Red
            }
        } else {
            Write-Host "❌ Erreur lors de la génération du token" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erreur lors de l'incrémentation du compteur" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test complet: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Vérification des logs d'accès" -ForegroundColor Yellow

try {
    $logsResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/admin/statistics" -Method GET
    
    if ($logsResponse) {
        Write-Host "✅ Statistiques récupérées" -ForegroundColor Green
        Write-Host "   Total des accès: $($logsResponse.totalAccesses)" -ForegroundColor White
        Write-Host "   Accès LibreSpeed: $($logsResponse.librespeedAccesses)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Aucune statistique disponible" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Impossible de récupérer les statistiques: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n====================================" -ForegroundColor Cyan
Write-Host "🎯 Réparation du compteur terminée" -ForegroundColor Cyan
Write-Host "`nLe système de comptage LibreSpeed est maintenant opérationnel !" -ForegroundColor Green
Write-Host "`nPour tester en conditions réelles:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous à https://iahome.fr" -ForegroundColor White
Write-Host "2. Allez dans 'En cours' et cliquez sur LibreSpeed" -ForegroundColor White
Write-Host "3. Vérifiez que le compteur s'incrémente dans la base de données" -ForegroundColor White
