# Script pour démarrer LibreSpeed
Write-Host "🚀 Démarrage de LibreSpeed" -ForegroundColor Cyan
Write-Host "===========================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de Docker" -ForegroundColor Red
    exit 1
}

# Vérifier si le réseau iahome-network existe
Write-Host "`n2. Vérification du réseau iahome-network..." -ForegroundColor Yellow
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

# Arrêter l'ancien container
Write-Host "`n3. Arrêt de l'ancien container..." -ForegroundColor Yellow
$oldContainer = "librespeed-prod"
$containerExists = docker ps -a --filter name=$oldContainer --format "{{.Names}}" 2>$null
if ($containerExists -eq $oldContainer) {
    Write-Host "   🛑 Arrêt de $oldContainer..." -ForegroundColor Yellow
    docker stop $oldContainer 2>$null
    docker rm $oldContainer 2>$null
    Write-Host "   ✅ $oldContainer arrêté et supprimé" -ForegroundColor Green
}

# Démarrer LibreSpeed
Write-Host "`n4. Démarrage de LibreSpeed..." -ForegroundColor Yellow
Set-Location librespeed
docker-compose up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ LibreSpeed démarré" -ForegroundColor Green
} else {
    Write-Host "   ❌ Erreur LibreSpeed" -ForegroundColor Red
    exit 1
}

# Vérifier le statut
Write-Host "`n5. Vérification du statut..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

try {
    $container = docker ps --filter name=librespeed-prod --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "   📊 Statut de LibreSpeed:" -ForegroundColor Cyan
    Write-Host $container -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification du statut" -ForegroundColor Yellow
}

# Test de connectivité
Write-Host "`n6. Test de connectivité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8085" -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ LibreSpeed accessible localement" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  LibreSpeed répond avec le code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  LibreSpeed n'est pas encore accessible localement" -ForegroundColor Yellow
}

Write-Host "`n🎯 LibreSpeed démarré avec succès !" -ForegroundColor Green
Write-Host "   🌐 Accès local: http://localhost:8085" -ForegroundColor Cyan
Write-Host "   🌐 Accès public: https://librespeed.iahome.fr" -ForegroundColor Cyan