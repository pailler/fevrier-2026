# Script de verification du deploiement iahome.fr
Write-Host "Verification du deploiement iahome.fr" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Verifier les conteneurs Docker
Write-Host "`n1. Statut des conteneurs Docker:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Verifier l'application principale
Write-Host "`n2. Test de l'application principale:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10
    Write-Host "   Application principale: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Application principale: ERREUR" -ForegroundColor Red
}

# Verifier l'endpoint de sante
Write-Host "`n3. Test de l'endpoint de sante:" -ForegroundColor Yellow
try {
    $health = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -TimeoutSec 10 | ConvertFrom-Json
    Write-Host "   Endpoint de sante: OK (Status: $($health.status))" -ForegroundColor Green
    Write-Host "   Memoire utilisee: $($health.memory.used)MB / $($health.memory.total)MB" -ForegroundColor Cyan
} catch {
    Write-Host "   Endpoint de sante: ERREUR" -ForegroundColor Red
}

# Verifier Traefik
Write-Host "`n4. Test de Traefik:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080" -Method Head -TimeoutSec 10
    Write-Host "   Dashboard Traefik: OK (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   Dashboard Traefik: ERREUR" -ForegroundColor Red
}

# Verifier les services externes
Write-Host "`n5. Test des services externes:" -ForegroundColor Yellow

$services = @(
    @{Name="Stirling-PDF"; Port="8081"},
    @{Name="MeTube"; Port="8082"},
    @{Name="LibreSpeed"; Port="8083"},
    @{Name="PSITransfer"; Port="8084"},
    @{Name="Polr (QRCode)"; Port="8086"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($service.Port)" -Method Head -TimeoutSec 5
        Write-Host "   $($service.Name): OK (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "   $($service.Name): ERREUR" -ForegroundColor Red
    }
}

# Resume
Write-Host "`n=====================================" -ForegroundColor Green
Write-Host "RESUME DU DEPLOIEMENT:" -ForegroundColor Green
Write-Host "Application principale: https://iahome.fr" -ForegroundColor Cyan
Write-Host "Dashboard Traefik: http://localhost:8080" -ForegroundColor Cyan
Write-Host "Services externes: Ports 8081-8086" -ForegroundColor Cyan
Write-Host "`nPour acceder a l'application:" -ForegroundColor Yellow
Write-Host "   Local: http://localhost:3000" -ForegroundColor White
Write-Host "   Production: https://iahome.fr" -ForegroundColor White
