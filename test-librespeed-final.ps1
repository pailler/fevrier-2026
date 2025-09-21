# Test final du système LibreSpeed
Write-Host "🧪 Test final du système LibreSpeed" -ForegroundColor Cyan

# Test 1: Accès sans token (doit rediriger vers login)
Write-Host "`n1️⃣ Test accès sans token..." -ForegroundColor Yellow
$response1 = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method HEAD -UseBasicParsing
Write-Host "Status: $($response1.StatusCode)" -ForegroundColor Green

# Test 2: Accès avec token (doit rediriger vers LibreSpeed)
Write-Host "`n2️⃣ Test accès avec token..." -ForegroundColor Yellow
$response2 = Invoke-WebRequest -Uri "https://librespeed.iahome.fr/?token=0mu7iqen43x8dhzouj9o0yf" -Method HEAD -UseBasicParsing
Write-Host "Status: $($response2.StatusCode)" -ForegroundColor Green

# Test 3: Test de l'API de validation
Write-Host "`n3️⃣ Test API validation token..." -ForegroundColor Yellow
$body = @{
    token = "0mu7iqen43x8dhzouj9o0yf"
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

Write-Host "`n✅ Tests terminés !" -ForegroundColor Cyan
Write-Host "`n📋 Note: La redirection côté client ne fonctionne qu'en navigateur." -ForegroundColor Yellow
Write-Host "   - Ouvrez https://librespeed.iahome.fr/?token=0mu7iqen43x8dhzouj9o0yf dans votre navigateur" -ForegroundColor Gray
Write-Host "   - Vous devriez être redirigé vers l'application LibreSpeed" -ForegroundColor Gray
