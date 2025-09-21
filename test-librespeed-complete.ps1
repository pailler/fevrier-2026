# Test complet du système LibreSpeed
Write-Host "🧪 Test du système LibreSpeed complet" -ForegroundColor Cyan

# Test 1: Accès direct sans token (doit rediriger vers login)
Write-Host "`n1️⃣ Test accès direct sans token..." -ForegroundColor Yellow
$response1 = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method HEAD -UseBasicParsing
Write-Host "Status: $($response1.StatusCode)" -ForegroundColor Green

# Test 2: Accès avec token valide
Write-Host "`n2️⃣ Test accès avec token valide..." -ForegroundColor Yellow
$response2 = Invoke-WebRequest -Uri "https://librespeed.iahome.fr/?token=tol25e5o2qmryyfcsymnh" -Method HEAD -UseBasicParsing
Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Green

# Test 3: Test de l'API de validation de token
Write-Host "`n3️⃣ Test API validation token..." -ForegroundColor Yellow
$body = @{
    token = "tol25e5o2qmryyfcsymnh"
} | ConvertTo-Json

try {
    $response3 = Invoke-RestMethod -Uri "https://iahome.fr/api/validate-librespeed-token" -Method POST -Body $body -ContentType "application/json"
    Write-Host "API Response: $($response3.success)" -ForegroundColor Green
    if ($response3.success) {
        Write-Host "User ID: $($response3.magicLinkData.userId)" -ForegroundColor Green
        Write-Host "Usage: $($response3.magicLinkData.usageCount)/$($response3.magicLinkData.maxUsage)" -ForegroundColor Green
    }
} catch {
    Write-Host "Erreur API: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test de l'API de génération de token
Write-Host "`n4️⃣ Test API génération token..." -ForegroundColor Yellow
$tokenBody = @{
    userId = "4ff83788-7bdb-4633-a693-3ad98006fed5"
    userEmail = "regispailler@gmail.com"
} | ConvertTo-Json

try {
    $response4 = Invoke-RestMethod -Uri "https://iahome.fr/api/librespeed-token" -Method POST -Body $tokenBody -ContentType "application/json"
    Write-Host "Token généré: $($response4.success)" -ForegroundColor Green
    if ($response4.success) {
        Write-Host "Token: $($response4.token)" -ForegroundColor Green
    }
} catch {
    Write-Host "Erreur génération token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n✅ Tests terminés !" -ForegroundColor Cyan
