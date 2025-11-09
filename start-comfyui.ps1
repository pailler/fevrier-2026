# Script pour démarrer ComfyUI via Docker
Write-Host "🚀 Démarrage de ComfyUI" -ForegroundColor Cyan
Write-Host "=======================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Docker est en cours d'exécution
Write-Host "1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
        Write-Host "   💡 Veuillez démarrer Docker Desktop d'abord" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de Docker" -ForegroundColor Red
    exit 1
}

# Vérifier si le réseau iahome-network existe
Write-Host ""
Write-Host "2. Vérification du réseau iahome-network..." -ForegroundColor Yellow
try {
    $networkExists = docker network ls --filter name=iahome-network --format "{{.Name}}" 2>$null
    if ($networkExists -eq "iahome-network") {
        Write-Host "   ✅ Réseau iahome-network trouvé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Création du réseau iahome-network..." -ForegroundColor Yellow
        docker network create iahome-network
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Réseau iahome-network créé" -ForegroundColor Green
        } else {
            Write-Host "   ❌ Erreur lors de la création du réseau" -ForegroundColor Red
            exit 1
        }
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification du réseau" -ForegroundColor Red
    exit 1
}

# Chemin vers le docker-compose.yml de ComfyUI
$comfyuiPath = Join-Path $PSScriptRoot "docker-services\essentiels\comfyui\docker-compose.yml"
$comfyuiPath = Resolve-Path $comfyuiPath -ErrorAction SilentlyContinue

if (-not $comfyuiPath) {
    Write-Host ""
    Write-Host "   ❌ Erreur: Impossible de trouver docker-compose.yml pour ComfyUI" -ForegroundColor Red
    Write-Host "      Chemin recherché: docker-services\essentiels\comfyui\docker-compose.yml" -ForegroundColor Yellow
    exit 1
}

# Démarrer ComfyUI
Write-Host ""
Write-Host "3. Démarrage de ComfyUI..." -ForegroundColor Yellow
try {
    $comfyuiDir = Split-Path $comfyuiPath
    Push-Location $comfyuiDir
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ ComfyUI démarré avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du démarrage de ComfyUI" -ForegroundColor Red
        Pop-Location
        exit 1
    }
    Pop-Location
} catch {
    Write-Host "   ❌ Erreur lors du démarrage de ComfyUI: $_" -ForegroundColor Red
    Pop-Location
    exit 1
}

# Attendre que le service soit prêt
Write-Host ""
Write-Host "4. Attente du démarrage complet..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut du container
Write-Host ""
Write-Host "5. Vérification du statut..." -ForegroundColor Yellow
try {
    $containerStatus = docker ps --filter name=comfyui --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>$null
    if ($containerStatus -match "comfyui") {
        Write-Host "   ✅ Container ComfyUI en cours d'exécution" -ForegroundColor Green
        Write-Host ""
        Write-Host $containerStatus -ForegroundColor White
    } else {
        Write-Host "   ⚠️  Container ComfyUI non trouvé ou arrêté" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez les logs avec: docker logs comfyui" -ForegroundColor Cyan
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification du statut" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   ComfyUI démarré !" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "🌐 Accès à ComfyUI:" -ForegroundColor Green
Write-Host "   URL: https://comfyui.iahome.fr" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   Voir les logs: docker logs -f comfyui" -ForegroundColor Gray
Write-Host "   Arrêter: docker stop comfyui" -ForegroundColor Gray
Write-Host "   Redémarrer: docker restart comfyui" -ForegroundColor Gray
Write-Host ""

