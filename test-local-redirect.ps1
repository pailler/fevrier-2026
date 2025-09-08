# Test de redirection locale
Write-Host "=== Test de redirection iahome.fr ===" -ForegroundColor Green

# Test 1: Vérifier l'application locale
Write-Host "`n1. Test application locale (localhost:3000):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10
    Write-Host "✅ Application locale accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Application locale non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier l'application via Traefik
Write-Host "`n2. Test via Traefik (localhost:80):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -Method Head -TimeoutSec 10
    Write-Host "✅ Traefik accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Traefik non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier l'application via Traefik HTTPS
Write-Host "`n3. Test via Traefik HTTPS (localhost:443):" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost" -Method Head -TimeoutSec 10 -SkipCertificateCheck
    Write-Host "✅ Traefik HTTPS accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Traefik HTTPS non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier l'application via iahome.fr
Write-Host "`n4. Test via iahome.fr:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 10
    Write-Host "✅ iahome.fr accessible: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Headers: $($response.Headers.Keys -join ', ')" -ForegroundColor Cyan
} catch {
    Write-Host "❌ iahome.fr non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Vérifier les conteneurs Docker
Write-Host "`n5. Vérification des conteneurs Docker:" -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host $containers

Write-Host "`n=== Fin des tests ===" -ForegroundColor Green
