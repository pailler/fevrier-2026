# Script pour dÃ©marrer ComfyUI via Docker
Write-Host "[DEMARRAGE] DÃ©marrage de ComfyUI..." -ForegroundColor Cyan

# VÃ©rifier si Docker est en cours d'exÃ©cution
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Docker n'est pas en cours d'exÃ©cution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "[ERREUR] Erreur lors de la vÃ©rification de Docker" -ForegroundColor Red
    exit 1
}

# Chemin vers le docker-compose.yml de ComfyUI
$comfyuiPath = Join-Path $PSScriptRoot "docker-services\essentiels\comfyui\docker-compose.yml"
$comfyuiPath = Resolve-Path $comfyuiPath -ErrorAction SilentlyContinue

if (-not $comfyuiPath) {
    Write-Host "[ERREUR] Impossible de trouver docker-compose.yml pour ComfyUI" -ForegroundColor Red
    exit 1
}

# DÃ©marrer ComfyUI
$comfyuiDir = Split-Path $comfyuiPath
Push-Location $comfyuiDir
docker-compose up -d
Pop-Location

Write-Host "[OK] ComfyUI dÃ©marrÃ©" -ForegroundColor Green
