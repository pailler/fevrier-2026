# Script pour verifier si Docker est pret et attendre si necessaire

Write-Host "Verification de Docker..." -ForegroundColor Cyan

$maxWait = 180 # 3 minutes maximum
$waited = 0
$dockerReady = $false

while ($waited -lt $maxWait) {
    try {
        $result = docker info 2>&1
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Host "[OK] Docker est pret !" -ForegroundColor Green
            break
        }
    } catch {
        # Continue d'attendre
    }
    
    Start-Sleep -Seconds 5
    $waited += 5
    
    if ($waited % 15 -eq 0) {
        Write-Host "En attente... ($waited secondes)" -ForegroundColor Yellow
    }
}

if (-not $dockerReady) {
    Write-Host "[ERROR] Docker n'est pas pret apres $maxWait secondes" -ForegroundColor Red
    Write-Host "Veuillez redemarrer Docker Desktop manuellement" -ForegroundColor Yellow
    exit 1
}

Write-Host "`nDemarrage des services..." -ForegroundColor Cyan
$RootPath = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$dockerComposePath = Join-Path $RootPath "docker-services\essentiels"

if (Test-Path $dockerComposePath) {
    Push-Location $dockerComposePath
    docker-compose up -d
    Pop-Location
    
    Write-Host "`n[OK] Services demarres !" -ForegroundColor Green
    Write-Host "`nConteneurs en cours d'execution :" -ForegroundColor Cyan
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} else {
    Write-Host "[ERROR] Repertoire docker-services\essentiels non trouve" -ForegroundColor Red
}






















