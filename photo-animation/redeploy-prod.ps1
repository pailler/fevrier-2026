# Rebuild production Photo Vivante (port 7887)
# Usage: .\redeploy-prod.ps1  (depuis photo-animation)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
if (-not (Test-Path (Join-Path $Root "app.py"))) {
    $Root = Join-Path (Get-Location).Path "photo-animation"
}
Set-Location $Root

Write-Host "=== Rebuild PROD Photo Vivante ===" -ForegroundColor Cyan
docker info 2>$null | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker non disponible. Demarrez Docker Desktop." -ForegroundColor Red
    exit 1
}

New-Item -ItemType Directory -Path (Join-Path $Root "outputs") -Force | Out-Null

Write-Host "Build image (no cache)..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml build --no-cache
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Redemarrage conteneur..." -ForegroundColor Yellow
docker compose -f docker-compose.prod.yml up -d --force-recreate --remove-orphans
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

Write-Host "Attente healthcheck..." -ForegroundColor Yellow
for ($i = 1; $i -le 60; $i++) {
    try {
        $r = Invoke-WebRequest -Uri "http://localhost:7887" -UseBasicParsing -TimeoutSec 5
        if ($r.StatusCode -eq 200) {
            Write-Host "[OK] http://localhost:7887 (attempt $i)" -ForegroundColor Green
            docker ps --filter "name=photo-vivante-iahome" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
            exit 0
        }
    } catch {
        Write-Host "  ... $i/60"
    }
    Start-Sleep -Seconds 5
}

Write-Host "[!] Service demarre mais healthcheck non confirme - verifiez les logs:" -ForegroundColor Yellow
Write-Host "    docker logs photo-vivante-iahome --tail 40" -ForegroundColor Gray
exit 1
