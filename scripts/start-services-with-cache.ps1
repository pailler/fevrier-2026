# Script pour démarrer les services Docker avec le nouveau cache centralisé
# Attend que Docker Desktop soit prêt avant de démarrer les services

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE DES SERVICES AVEC CACHE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $PSScriptRoot
Set-Location $RootPath

# Vérifier que Docker est prêt
Write-Host "1. Verification de Docker Desktop...`n" -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
$dockerReady = $false

while ($attempt -lt $maxAttempts -and -not $dockerReady) {
    $dockerCheck = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK - Docker est pret !" -ForegroundColor Green
        $dockerReady = $true
    } else {
        $attempt++
        if ($attempt -eq 1) {
            Write-Host "   Docker n'est pas pret, attente..." -ForegroundColor Yellow
            Write-Host "   (Si Docker Desktop n'est pas demarre, lancez-le manuellement)" -ForegroundColor Gray
        }
        Write-Host "   Tentative $attempt/$maxAttempts..." -ForegroundColor DarkGray
        Start-Sleep -Seconds 5
    }
}

if (-not $dockerReady) {
    Write-Host "`nERREUR - Docker Desktop n'est pas pret apres 2.5 minutes" -ForegroundColor Red
    Write-Host "`nInstructions:" -ForegroundColor Yellow
    Write-Host "1. Demarrez Docker Desktop manuellement" -ForegroundColor White
    Write-Host "2. Attendez que l'icone Docker soit verte dans la barre des taches" -ForegroundColor White
    Write-Host "3. Relancez ce script ou executez manuellement:" -ForegroundColor White
    Write-Host "   cd voice-isolation-service" -ForegroundColor Gray
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
    Write-Host "   cd ..\hunyuan2-spz" -ForegroundColor Gray
    Write-Host "   docker-compose up -d" -ForegroundColor Gray
    Write-Host ""
    exit 1
}

# Vérifier que le dossier cache existe
Write-Host "`n2. Verification du dossier ai-models-cache...`n" -ForegroundColor Yellow
if (-not (Test-Path "ai-models-cache")) {
    Write-Host "   Creation du dossier ai-models-cache..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path "ai-models-cache" -Force | Out-Null
    New-Item -ItemType Directory -Path "ai-models-cache\torch" -Force | Out-Null
    New-Item -ItemType Directory -Path "ai-models-cache\huggingface" -Force | Out-Null
    Write-Host "   OK - Dossiers crees" -ForegroundColor Green
} else {
    Write-Host "   OK - Dossier ai-models-cache existe" -ForegroundColor Green
    if (-not (Test-Path "ai-models-cache\torch")) {
        New-Item -ItemType Directory -Path "ai-models-cache\torch" -Force | Out-Null
    }
    if (-not (Test-Path "ai-models-cache\huggingface")) {
        New-Item -ItemType Directory -Path "ai-models-cache\huggingface" -Force | Out-Null
    }
}

# Démarrer voice-isolation-service
Write-Host "`n3. Demarrage de voice-isolation-service...`n" -ForegroundColor Yellow
Set-Location "voice-isolation-service"
docker-compose down 2>&1 | Out-Null
Write-Host "   Construction de l'image..." -ForegroundColor Gray
docker-compose build 2>&1 | Out-Null
Write-Host "   Demarrage du service..." -ForegroundColor Gray
docker-compose up -d 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK - voice-isolation-service demarre" -ForegroundColor Green
    Start-Sleep -Seconds 3
    $status = docker ps --filter "name=voice-isolation-service" --format "{{.Status}}" 2>&1
    if ($status) {
        Write-Host "   Statut: $status" -ForegroundColor Gray
    }
} else {
    Write-Host "   ERREUR - Impossible de demarrer voice-isolation-service" -ForegroundColor Red
    docker-compose logs --tail 5 2>&1 | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }
}

Set-Location ".."

# Démarrer hunyuan3d
Write-Host "`n4. Demarrage de hunyuan3d...`n" -ForegroundColor Yellow
Set-Location "hunyuan2-spz"
docker-compose down 2>&1 | Out-Null
Write-Host "   Construction de l'image..." -ForegroundColor Gray
docker-compose build 2>&1 | Out-Null
Write-Host "   Demarrage du service..." -ForegroundColor Gray
docker-compose up -d 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   OK - hunyuan3d demarre" -ForegroundColor Green
    Start-Sleep -Seconds 3
    $status = docker ps --filter "name=hunyuan3d" --format "{{.Status}}" 2>&1
    if ($status) {
        Write-Host "   Statut: $status" -ForegroundColor Gray
    }
} else {
    Write-Host "   ERREUR - Impossible de demarrer hunyuan3d" -ForegroundColor Red
    docker-compose logs --tail 5 2>&1 | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }
}

Set-Location ".."

# Vérification finale
Write-Host "`n5. Verification finale...`n" -ForegroundColor Yellow
$services = docker ps --filter "name=voice-isolation-service" --filter "name=hunyuan3d" --format "{{.Names}}: {{.Status}}" 2>&1
if ($services) {
    Write-Host "   Services en cours d'execution:" -ForegroundColor Green
    $services | ForEach-Object { Write-Host "   $_" -ForegroundColor White }
} else {
    Write-Host "   Aucun service en cours d'execution" -ForegroundColor Yellow
}

# Résumé
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  DEMARRAGE TERMINE" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green

Write-Host "Configuration du cache:" -ForegroundColor Cyan
Write-Host "  - ai-models-cache/torch/ -> voice-isolation-service" -ForegroundColor White
Write-Host "  - ai-models-cache/huggingface/ -> hunyuan3d" -ForegroundColor White
Write-Host ""

Write-Host "Les modeles seront telecharges dans ai-models-cache/ au premier demarrage" -ForegroundColor Yellow
Write-Host "et seront persistants entre les redemarrages.`n" -ForegroundColor Yellow

Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "  docker logs voice-isolation-service -f" -ForegroundColor White
Write-Host "  docker logs hunyuan3d -f" -ForegroundColor White
Write-Host "  docker ps" -ForegroundColor White
Write-Host ""
