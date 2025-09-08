# Test rapide de MeTube
Write-Host "Test rapide de MeTube" -ForegroundColor Cyan

Write-Host "`n1. Test de resolution DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "metube.iahome.fr" -ErrorAction Stop
    Write-Host "DNS resolu: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "DNS non resolu: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Test HTTP..." -ForegroundColor Yellow
try {
    $httpResponse = Invoke-WebRequest -Uri "http://metube.iahome.fr" -Method GET -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "HTTP accessible (Code: $($httpResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Erreur HTTP: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test HTTPS..." -ForegroundColor Yellow
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
    Write-Host "HTTPS accessible (Code: $($httpsResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Erreur HTTPS: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Test local..." -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:8082" -Method GET -TimeoutSec 5
    Write-Host "Local accessible (Code: $($localResponse.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "Erreur local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine" -ForegroundColor Cyan

