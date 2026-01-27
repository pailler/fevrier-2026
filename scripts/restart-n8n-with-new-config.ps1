# Script pour redemarrer n8n avec la nouvelle configuration OAuth
# Applique les changements de configuration pour corriger l'URL OAuth redirect

Write-Host "Redemarrage de n8n avec la nouvelle configuration OAuth..." -ForegroundColor Cyan
Write-Host ""

# Verifier si Docker est en cours d'execution
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Docker n'est pas en cours d'execution" -ForegroundColor Red
    exit 1
}

# Verifier si le container n8n existe
$n8nContainer = docker ps -a --filter "name=^n8n$" --format "{{.Names}}"
if (-not $n8nContainer) {
    Write-Host "ERREUR: Le container n8n n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Etape 1: Arret du conteneur n8n..." -ForegroundColor Yellow
docker stop n8n 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Conteneur arrete" -ForegroundColor Green
} else {
    Write-Host "AVERTISSEMENT: Impossible d'arreter le conteneur (peut-etre deja arrete)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Etape 2: Redemarrage avec la nouvelle configuration..." -ForegroundColor Yellow

# Redemarrer avec docker-compose pour appliquer les nouvelles variables d'environnement
$composeFile = "docker-services\essentiels\n8n-postgres-docker-compose.yml"
if (Test-Path $composeFile) {
    Push-Location "docker-services\essentiels"
    docker-compose -f n8n-postgres-docker-compose.yml up -d n8n 2>&1 | Out-Null
    Pop-Location
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Conteneur redemarre avec la nouvelle configuration" -ForegroundColor Green
    } else {
        Write-Host "ERREUR: Impossible de redemarrer avec docker-compose" -ForegroundColor Red
        Write-Host "Tentative avec docker restart..." -ForegroundColor Yellow
        docker restart n8n 2>&1 | Out-Null
    }
} else {
    Write-Host "Fichier docker-compose introuvable, utilisation de docker restart..." -ForegroundColor Yellow
    docker restart n8n 2>&1 | Out-Null
}

Write-Host ""
Write-Host "Etape 3: Attente du demarrage complet..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host ""
Write-Host "Etape 4: Verification du statut..." -ForegroundColor Yellow
$status = docker ps --filter "name=^n8n$" --format "{{.Names}}\t{{.Status}}"
if ($status) {
    Write-Host "OK: Conteneur en cours d'execution" -ForegroundColor Green
    Write-Host $status -ForegroundColor Gray
} else {
    Write-Host "ERREUR: Le conteneur n'est pas en cours d'execution" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redemarrage termine !" -ForegroundColor Cyan
Write-Host ""
Write-Host "IMPORTANT: Pour que l'URL OAuth redirect soit mise a jour:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous a https://n8n.regispailler.fr" -ForegroundColor White
Write-Host "2. Allez dans Credentials" -ForegroundColor White
Write-Host "3. Ouvrez chaque credential OAuth2 (Gmail, etc.)" -ForegroundColor White
Write-Host "4. L'URL OAuth Redirect devrait maintenant afficher:" -ForegroundColor White
Write-Host "   https://n8n.regispailler.fr/rest/oauth2-credential/callback" -ForegroundColor Green
Write-Host ""
Write-Host "Si l'URL est toujours localhost:5678:" -ForegroundColor Yellow
Write-Host "- Attendez quelques secondes et rafraichissez la page" -ForegroundColor White
Write-Host "- Videz le cache du navigateur (Ctrl+F5)" -ForegroundColor White
Write-Host "- Verifiez les logs: docker logs n8n --tail 50" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
