# Script pour démarrer n8n
Write-Host "Démarrage de n8n..." -ForegroundColor Green

$composeFile = Join-Path $PSScriptRoot "docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    Write-Host "Erreur: docker-compose.yml introuvable dans $PSScriptRoot" -ForegroundColor Red
    exit 1
}

# Vérifier si Docker est en cours d'exécution
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "Erreur: Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Démarrer n8n
Write-Host "Démarrage du conteneur n8n..." -ForegroundColor Yellow
docker-compose -f $composeFile up -d n8n

if ($LASTEXITCODE -eq 0) {
    Write-Host "n8n démarré avec succès!" -ForegroundColor Green
    Write-Host "Accès: http://localhost:5678/" -ForegroundColor Cyan
    Write-Host "Identifiants par défaut: admin / admin" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Vérification du statut..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    docker ps --filter "name=n8n-iahome" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} else {
    Write-Host "Erreur lors du démarrage de n8n" -ForegroundColor Red
    exit 1
}


