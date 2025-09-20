# Script de test pour le compteur d'accès LibreSpeed
Write-Host "📊 Test du compteur d'accès LibreSpeed" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Configuration de test
$testUserId = "test-user-123"
$testUserEmail = "test@example.com"
$baseUrl = "https://iahome.fr"

Write-Host "`n1. Test de l'API d'incrémentation du compteur" -ForegroundColor Yellow

try {
    $incrementBody = @{
        userId = $testUserId
        userEmail = $testUserEmail
    } | ConvertTo-Json

    $incrementResponse = Invoke-RestMethod -Uri "$baseUrl/api/increment-librespeed-access" -Method POST -Body $incrementBody -ContentType "application/json"
    
    if ($incrementResponse.success) {
        Write-Host "✅ Compteur incrémenté avec succès" -ForegroundColor Green
        Write-Host "   Usage: $($incrementResponse.usage_count)/$($incrementResponse.max_usage)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors de l'incrémentation" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️ Accès refusé (normal si l'utilisateur n'a pas LibreSpeed activé)" -ForegroundColor Yellow
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors du test d'incrémentation: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n2. Test de l'API de génération de token" -ForegroundColor Yellow

try {
    $tokenBody = @{
        userId = $testUserId
        userEmail = $testUserEmail
    } | ConvertTo-Json

    $tokenResponse = Invoke-RestMethod -Uri "$baseUrl/api/librespeed-token" -Method POST -Body $tokenBody -ContentType "application/json"
    
    if ($tokenResponse.success) {
        Write-Host "✅ Token généré avec succès" -ForegroundColor Green
        Write-Host "   Token: $($tokenResponse.token.Substring(0, 10))..." -ForegroundColor White
        Write-Host "   Expiration: $($tokenResponse.expiresIn) secondes" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors de la génération du token" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️ Accès refusé (normal si l'utilisateur n'a pas LibreSpeed activé)" -ForegroundColor Yellow
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors du test de génération de token: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n3. Test de l'API de vérification d'accès" -ForegroundColor Yellow

try {
    $checkBody = @{
        userId = $testUserId
    } | ConvertTo-Json

    $checkResponse = Invoke-RestMethod -Uri "$baseUrl/api/check-librespeed-access" -Method POST -Body $checkBody -ContentType "application/json"
    
    if ($checkResponse.hasAccess) {
        Write-Host "✅ Accès autorisé" -ForegroundColor Green
        Write-Host "   Tokens disponibles: $($checkResponse.tokens.Count)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Accès refusé: $($checkResponse.reason)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️ Accès refusé (normal si l'utilisateur n'a pas LibreSpeed activé)" -ForegroundColor Yellow
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors du test de vérification: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n4. Test de l'API de vérification de module" -ForegroundColor Yellow

try {
    $moduleBody = @{
        userId = $testUserId
        moduleId = "librespeed"
    } | ConvertTo-Json

    $moduleResponse = Invoke-RestMethod -Uri "$baseUrl/api/check-module-access" -Method POST -Body $moduleBody -ContentType "application/json"
    
    if ($moduleResponse.success) {
        Write-Host "✅ Module accessible" -ForegroundColor Green
        Write-Host "   Usage: $($moduleResponse.usage_count)/$($moduleResponse.max_usage)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Module non accessible: $($moduleResponse.error)" -ForegroundColor Yellow
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "⚠️ Module non accessible (normal si l'utilisateur n'a pas LibreSpeed activé)" -ForegroundColor Yellow
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor White
    } else {
        Write-Host "❌ Erreur lors du test de module: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n=====================================" -ForegroundColor Cyan
Write-Host "🎯 Tests du compteur LibreSpeed terminés" -ForegroundColor Cyan
Write-Host "`nPour tester avec un utilisateur réel:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous à https://iahome.fr" -ForegroundColor White
Write-Host "2. Allez dans la section 'En cours'" -ForegroundColor White
Write-Host "3. Cliquez sur le module LibreSpeed" -ForegroundColor White
Write-Host "4. Vérifiez les logs dans la console du navigateur" -ForegroundColor White
Write-Host "5. Vérifiez la base de données pour voir l'incrémentation" -ForegroundColor White
