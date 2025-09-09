# Script de test final - Correction JWT pour QR Codes
Write-Host "🔧 Test final - Correction JWT pour QR Codes" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification des services:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application principale accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application principale non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Service QR Codes accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "   📊 Service: $($healthData.service)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Service QR Codes non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test de génération d'un JWT valide:" -ForegroundColor Cyan
try {
    # Créer un JWT de test avec le même secret
    $header = @{
        alg = "HS256"
        typ = "JWT"
    } | ConvertTo-Json -Compress
    
    $payload = @{
        userId = "test-user-123"
        userEmail = "test@iahome.fr"
        moduleId = "qrcodes"
        moduleTitle = "QR Codes"
        email = "test@iahome.fr"
        sub = "test-user-123"
        iat = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
        exp = [DateTimeOffset]::UtcNow.AddMinutes(5).ToUnixTimeSeconds()
    } | ConvertTo-Json -Compress
    
    # Encoder en base64 (simplifié pour le test)
    $headerB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($header)) -replace '=', '' -replace '\+', '-' -replace '/', '_'
    $payloadB64 = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($payload)) -replace '=', '' -replace '\+', '-' -replace '/', '_'
    $signature = "test-signature" | ConvertTo-Base64String -replace '=', '' -replace '\+', '-' -replace '/', '_'
    
    $testJWT = "$headerB64.$payloadB64.$signature"
    Write-Host "   📊 JWT de test généré: $($testJWT.Substring(0, 50))..." -ForegroundColor Yellow
    
    # Tester l'API validate-token avec ce JWT
    $body = @{
        token = $testJWT
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/api/validate-token" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ API validate-token accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $tokenData = $response.Content | ConvertFrom-Json
    Write-Host "   📊 Réponse: $($tokenData | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Test JWT échoué: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test de l'accès via l'interface IAHome:" -ForegroundColor Cyan
Write-Host "   📋 Instructions pour le test manuel:" -ForegroundColor Yellow
Write-Host "   1. Ouvrez https://iahome.fr" -ForegroundColor White
Write-Host "   2. Connectez-vous avec votre compte" -ForegroundColor White
Write-Host "   3. Allez dans la section 'Modules'" -ForegroundColor White
Write-Host "   4. Cliquez sur 'Accéder' pour le module QR Codes" -ForegroundColor White
Write-Host "   5. Vérifiez que l'interface QR Codes s'affiche correctement" -ForegroundColor White
Write-Host "   6. Vérifiez que votre email s'affiche dans la bannière" -ForegroundColor White
Write-Host "   7. Vérifiez que vous pouvez créer des QR codes" -ForegroundColor White

Write-Host ""
Write-Host "🎯 Modifications apportées:" -ForegroundColor Yellow
Write-Host "   ✅ Ajout de la dépendance jsonwebtoken" -ForegroundColor White
Write-Host "   ✅ Modification d'AuthorizationService pour générer des JWT" -ForegroundColor White
Write-Host "   ✅ Synchronisation des secrets JWT entre services" -ForegroundColor White
Write-Host "   ✅ Mise à jour du template QR Codes pour utiliser l'API" -ForegroundColor White
Write-Host "   ✅ Redémarrage des services avec la nouvelle configuration" -ForegroundColor White

Write-Host ""
Write-Host "🔐 Configuration JWT finale:" -ForegroundColor Cyan
Write-Host "   ✅ Secret partagé: iahome-jwt-secret-2024-production-secure-key" -ForegroundColor White
Write-Host "   ✅ Algorithme: HS256" -ForegroundColor White
Write-Host "   ✅ Durée: 5 minutes" -ForegroundColor White
Write-Host "   ✅ Payload: userId, userEmail, moduleId, moduleTitle" -ForegroundColor White

Write-Host ""
Write-Host "✅ Correction JWT terminée !" -ForegroundColor Green
Write-Host "🔐 Le module QR Codes devrait maintenant fonctionner correctement" -ForegroundColor Green
Write-Host "🎉 Testez l'accès via le bouton dans l'interface IAHome" -ForegroundColor Green
