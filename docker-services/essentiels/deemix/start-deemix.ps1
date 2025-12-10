# Script pour démarrer le conteneur Deemix
# Usage: .\start-deemix.ps1

Write-Host "🚀 Démarrage de Deemix..." -ForegroundColor Cyan

# Vérifier que Docker est en cours d'exécution
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire deemix
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Vérifier que le réseau existe
Write-Host "`n📋 Vérification du réseau Docker..." -ForegroundColor Yellow
$networkExists = docker network ls --format "{{.Name}}" | Select-String -Pattern "^iahome-network$"
if (-not $networkExists) {
    Write-Host "   ⚠️  Le réseau 'iahome-network' n'existe pas. Création..." -ForegroundColor Yellow
    docker network create iahome-network
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Réseau créé" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de la création du réseau" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✅ Réseau existant" -ForegroundColor Green
}

# Vérifier si le conteneur existe déjà
Write-Host "`n📋 Vérification du conteneur..." -ForegroundColor Yellow
$containerExists = docker ps -a --filter name=deemix-iahome --format "{{.Names}}" | Select-String -Pattern "^deemix-iahome$"
if ($containerExists) {
    $containerRunning = docker ps --filter name=deemix-iahome --format "{{.Names}}" | Select-String -Pattern "^deemix-iahome$"
    if ($containerRunning) {
        Write-Host "   ✅ Le conteneur est déjà en cours d'exécution" -ForegroundColor Green
        Write-Host "`n🌐 Deemix est accessible sur: http://localhost:6595" -ForegroundColor Cyan
        exit 0
    } else {
        Write-Host "   ⚠️  Le conteneur existe mais n'est pas démarré. Démarrage..." -ForegroundColor Yellow
        docker start deemix-iahome
    }
} else {
    Write-Host "   📦 Création et démarrage du conteneur..." -ForegroundColor Yellow
    docker-compose up -d
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Conteneur démarré avec succès" -ForegroundColor Green
    
    # Attendre que le service soit prêt
    Write-Host "`n⏳ Attente du démarrage complet..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Vérifier les logs
    Write-Host "`n📋 Derniers logs:" -ForegroundColor Yellow
    docker logs deemix-iahome --tail 10
    
    Write-Host "`n✅ Deemix est maintenant accessible sur: http://localhost:6595" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur lors du démarrage du conteneur" -ForegroundColor Red
    Write-Host "`n📋 Logs d'erreur:" -ForegroundColor Yellow
    docker logs deemix-iahome --tail 20
    exit 1
}

























