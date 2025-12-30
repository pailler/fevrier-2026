# Script pour arrêter n8n
Write-Host "Arrêt de n8n..." -ForegroundColor Yellow

$composeFile = Join-Path $PSScriptRoot "docker-compose.yml"

if (-not (Test-Path $composeFile)) {
    Write-Host "Erreur: docker-compose.yml introuvable dans $PSScriptRoot" -ForegroundColor Red
    exit 1
}

# Arrêter n8n
docker-compose -f $composeFile stop n8n

if ($LASTEXITCODE -eq 0) {
    Write-Host "n8n arrêté avec succès!" -ForegroundColor Green
} else {
    Write-Host "Erreur lors de l'arrêt de n8n" -ForegroundColor Red
    exit 1
}



























