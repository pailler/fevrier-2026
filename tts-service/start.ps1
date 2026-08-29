# Démarrage du service TTS XTTS v2

Write-Host "Demarrage du service TTS XTTS v2..." -ForegroundColor Cyan

$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "Docker n'est pas en cours d'execution" -ForegroundColor Red
    exit 1
}

$iahomeNetwork = docker network ls | Select-String "iahome-network"
if (-not $iahomeNetwork) {
    Write-Host "Creation du reseau iahome-network..." -ForegroundColor Yellow
    docker network create iahome-network
}

. (Join-Path (Split-Path $PSScriptRoot -Parent) "scripts\models-path.config.ps1")
if (-not (Set-IaHomeModelsEnv -Quiet)) {
    Write-Host "Stability Matrix introuvable pour le cache modeles." -ForegroundColor Red
    exit 1
}
foreach ($path in @(Get-IaHomeCoquiCachePath, Get-IaHomeModelsCachePath)) {
    if (-not (Test-Path -LiteralPath $path)) {
        New-Item -ItemType Directory -Path $path -Force | Out-Null
    }
}
Write-Host "Cache Coqui : $(Get-IaHomeCoquiCachePath)" -ForegroundColor DarkGray
Write-Host "Cache HF    : $(Get-IaHomeModelsCachePath)" -ForegroundColor DarkGray

Write-Host "Construction de l'image Docker (peut prendre plusieurs minutes)..." -ForegroundColor Yellow
docker compose build

Write-Host "Demarrage du service..." -ForegroundColor Yellow
docker compose up -d

Write-Host "Service demarre sur http://localhost:8101" -ForegroundColor Green
Write-Host "Le modele XTTS (~1.8 Go) se telecharge au premier lancement..." -ForegroundColor Yellow

$maxAttempts = 60
$attempt = 0
$serviceReady = $false

while ($attempt -lt $maxAttempts -and -not $serviceReady) {
    Start-Sleep -Seconds 10
    $attempt++
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8101/" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serviceReady = $true
            Write-Host "Interface Gradio accessible!" -ForegroundColor Green
        }
    } catch {
        Write-Host "Tentative $attempt/$maxAttempts - chargement en cours..." -ForegroundColor Gray
    }
}

if (-not $serviceReady) {
    Write-Host "Le service demarre encore. Logs:" -ForegroundColor Yellow
    Write-Host "  docker logs tts-xtts-service -f" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "Pret! Ouvrez http://localhost:8101 dans votre navigateur." -ForegroundColor Cyan
}
