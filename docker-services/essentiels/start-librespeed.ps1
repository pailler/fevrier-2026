# Script pour démarrer LibreSpeed depuis le dossier essentiels
Write-Host "🚀 Démarrage de LibreSpeed (Essentiels)" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerStatus = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Docker est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
        Write-Host "   Veuillez démarrer Docker Desktop et réessayer" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification de Docker: $($_.Exception.Message)" -ForegroundColor Red
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
    Write-Host "   ❌ Erreur lors de la vérification du réseau: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Arrêter les anciens containers LibreSpeed s'ils existent
Write-Host "`n3. Arrêt des anciens containers LibreSpeed..." -ForegroundColor Yellow
try {
    $oldContainers = @("librespeed-iahome", "librespeed-auth", "librespeed-official")
    foreach ($container in $oldContainers) {
        $containerExists = docker ps -a --filter name=$container --format "{{.Names}}" 2>$null
        if ($containerExists -eq $container) {
            Write-Host "   🛑 Arrêt de $container..." -ForegroundColor Yellow
            docker stop $container 2>$null
            docker rm $container 2>$null
            Write-Host "   ✅ $container arrêté et supprimé" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de l'arrêt des anciens containers: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Démarrer les services LibreSpeed
Write-Host "`n4. Démarrage des services LibreSpeed..." -ForegroundColor Yellow
try {
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Services LibreSpeed démarrés avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du démarrage des services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérifier le statut des containers
Write-Host "`n5. Vérification du statut des containers..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $containers = docker ps --filter name=librespeed --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "   📊 Statut des containers LibreSpeed:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification du statut: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 LibreSpeed démarré depuis le dossier essentiels !" -ForegroundColor Green
Write-Host "   🌐 LibreSpeed: https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "   🔐 LibreSpeed Auth: https://librespeed.iahome.fr/auth" -ForegroundColor Cyan



