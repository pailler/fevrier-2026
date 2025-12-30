# Script pour redémarrer n8n
Write-Host "Redémarrage de n8n..." -ForegroundColor Yellow

$composeFile = Join-Path $PSScriptRoot "docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    Write-Host "Erreur: docker-compose.yml introuvable dans $PSScriptRoot" -ForegroundColor Red
    exit 1
}

# Redémarrer n8n
docker-compose -f $composeFile restart n8n

if ($LASTEXITCODE -eq 0) {
    Write-Host "n8n redémarré avec succès!" -ForegroundColor Green
    Write-Host "Accès: http://localhost:5678/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vérification du statut..." -ForegroundColor Yellow
    Start-Sleep -Seconds 3
    docker ps --filter "name=n8n-iahome" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
} else {
    Write-Host "Erreur lors du redémarrage de n8n" -ForegroundColor Red
    exit 1
}



























