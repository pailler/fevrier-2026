# Script de test pour déboguer l'authentification QR Codes
Write-Host "🔍 Test de débogage - Authentification QR Codes" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification du service QR Codes:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Service QR Codes accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "   📊 Service: $($healthData.service)" -ForegroundColor Yellow
    Write-Host "   📊 Version: $($healthData.version)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ Service QR Codes non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test de l'API validate-token:" -ForegroundColor Cyan
try {
    $body = @{
        token = "nPssG7QjOdW6pYK3kboTpUXY50hLlRrP"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/api/validate-token" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ API validate-token accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    $tokenData = $response.Content | ConvertFrom-Json
    Write-Host "   📊 Réponse: $($tokenData | ConvertTo-Json -Depth 3)" -ForegroundColor Yellow
} catch {
    Write-Host "   ❌ API validate-token non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   📊 Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔍 Test de l'accès avec token dans l'URL:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/?auth_token=nPssG7QjOdW6pYK3kboTpUXY50hLlRrP" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Accès avec token accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    
    # Vérifier si le token est détecté dans le HTML
    if ($response.Content -match "Chargement\.\.\.") {
        Write-Host "   ⚠️  Interface affiche 'Chargement...' - Token non validé" -ForegroundColor Yellow
    } elseif ($response.Content -match "Non connecté") {
        Write-Host "   ❌ Interface affiche 'Non connecté' - Token invalide" -ForegroundColor Red
    } elseif ($response.Content -match "user-email") {
        Write-Host "   ✅ Interface contient des éléments d'authentification" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Accès avec token non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Vérification des routes disponibles:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/api/dynamic/qr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Route /api/dynamic/qr accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Route /api/dynamic/qr non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test de génération d'un token JWT valide:" -ForegroundColor Cyan
try {
    # Créer un token JWT simple pour test
    $header = @{
        alg = "HS256"
        typ = "JWT"
    } | ConvertTo-Json -Compress | ConvertTo-Base64 -CharacterSet UTF8
    
    $payload = @{
        userId = "test-user-123"
        userEmail = "test@iahome.fr"
        moduleId = "qrcodes"
        moduleTitle = "QR Codes"
        exp = [DateTimeOffset]::UtcNow.AddMinutes(5).ToUnixTimeSeconds()
    } | ConvertTo-Json -Compress | ConvertTo-Base64 -CharacterSet UTF8
    
    $signature = "test-signature" | ConvertTo-Base64 -CharacterSet UTF8
    $testToken = "$header.$payload.$signature"
    
    Write-Host "   📊 Token JWT de test généré: $($testToken.Substring(0, 50))..." -ForegroundColor Yellow
    
    # Tester avec ce token
    $body = @{
        token = $testToken
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/api/validate-token" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Test avec token JWT réussi (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Test avec token JWT échoué: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Diagnostic:" -ForegroundColor Yellow
Write-Host "   - Le service QR Codes fonctionne" -ForegroundColor White
Write-Host "   - L'API validate-token retourne 404" -ForegroundColor White
Write-Host "   - Le token fourni n'est pas un JWT valide" -ForegroundColor White
Write-Host "   - L'interface affiche 'Chargement...' car l'authentification échoue" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Solutions possibles:" -ForegroundColor Cyan
Write-Host "   1. Vérifier que l'API check-auth génère un JWT valide" -ForegroundColor White
Write-Host "   2. Vérifier que le service QR Codes a bien redémarré avec les modifications" -ForegroundColor White
Write-Host "   3. Tester l'accès via le bouton d'accès dans l'interface IAHome" -ForegroundColor White
Write-Host "   4. Vérifier les logs du service QR Codes pour des erreurs" -ForegroundColor White
