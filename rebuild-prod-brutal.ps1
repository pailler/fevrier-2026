# Rebuild production brutal - iahome
# Nettoie tout, rebuild Next.js, Docker --no-cache, purge Cloudflare
# Usage: .\rebuild-prod-brutal.ps1

$ErrorActionPreference = "Stop"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REBUILD PRODUCTION BRUTAL - iahome" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root

# 1. Nettoyage brutal
Write-Host "`n[1/6] Nettoyage brutal..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item -Recurse -Force ".next"
    Write-Host "  .next supprime" -ForegroundColor Gray
}
if (Test-Path "node_modules\.cache") {
    Remove-Item -Recurse -Force "node_modules\.cache"
    Write-Host "  node_modules\.cache supprime" -ForegroundColor Gray
}
Write-Host "  OK" -ForegroundColor Green

# 2. Build Next.js production
Write-Host "`n[2/6] Build Next.js (production)..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build
if ($LASTEXITCODE -ne 0) { throw "Build Next.js echoue" }
Write-Host "  OK" -ForegroundColor Green

# 3. Docker down
Write-Host "`n[3/6] Arret des conteneurs Docker..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml down
Write-Host "  OK" -ForegroundColor Green

# 4. Docker build --no-cache
Write-Host "`n[4/6] Build Docker (--no-cache)..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml build --no-cache --pull
if ($LASTEXITCODE -ne 0) { throw "Build Docker echoue" }
Write-Host "  OK" -ForegroundColor Green

# 5. Docker up
Write-Host "`n[5/6] Demarrage des services..." -ForegroundColor Yellow
# Liberer le port 3000 si occupe (ex: next dev, autre processus)
$line = netstat -ano 2>$null | Select-String ":3000\s+.*LISTENING"
if ($line -and $line -match "\s+(\d+)\s*$") {
    $pid3000 = [int]$Matches[1]
    if ($pid3000 -gt 0) {
        Write-Host "  Liberation port 3000 (PID $pid3000)..." -ForegroundColor Gray
        Stop-Process -Id $pid3000 -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
}
docker compose -f docker-compose.prod.yml up -d
if ($LASTEXITCODE -ne 0) { throw "Docker up echoue" }
Write-Host "  OK" -ForegroundColor Green

# Attendre que l'app soit pret
Write-Host "  Attente 15s (healthcheck)..." -ForegroundColor Gray
Start-Sleep -Seconds 15

# 6. Purge Cloudflare
Write-Host "`n[6/6] Purge cache Cloudflare..." -ForegroundColor Yellow
try {
    $baseUrl = "https://iahome.fr"
    $purgeUrl = "$baseUrl/api/purge-cloudflare-cache"
    $response = Invoke-RestMethod -Uri $purgeUrl -Method POST -ContentType "application/json"
    if ($response.success) {
        Write-Host "  Cache Cloudflare purge avec succes" -ForegroundColor Green
    } else {
        Write-Host "  Reponse: $($response | ConvertTo-Json -Compress)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "  Erreur purge Cloudflare (OK si CLOUDFLARE_* non configure ou Access protege): $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "  Purge manuelle: https://dash.cloudflare.com > Caching > Purge Everything" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REBUILD TERMINE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "App: http://localhost:3000 | https://iahome.fr" -ForegroundColor White
