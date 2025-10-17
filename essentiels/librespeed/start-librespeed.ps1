# Script de démarrage de LibreSpeed dans le dossier essentiels
Write-Host "🚀 DÉMARRAGE LIBRESPEED ESSENTIELS" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan

# 1. Vérification de Docker
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    if ($dockerVersion) {
        Write-Host "✅ Docker installé: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker non installé" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur Docker: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Arrêt des conteneurs LibreSpeed existants
Write-Host "`n2. Arrêt des conteneurs LibreSpeed existants..." -ForegroundColor Yellow
try {
    $existingContainers = docker ps -a --filter "name=librespeed" --format "{{.Names}}"
    if ($existingContainers) {
        Write-Host "📦 Arrêt des conteneurs existants: $existingContainers" -ForegroundColor Yellow
        docker stop $existingContainers.Split("`n") | ForEach-Object { 
            if ($_.Trim()) { 
                Write-Host "✅ Conteneur arrêté: $($_.Trim())" -ForegroundColor Green
            }
        }
        docker rm $existingContainers.Split("`n") | ForEach-Object { 
            if ($_.Trim()) { 
                Write-Host "✅ Conteneur supprimé: $($_.Trim())" -ForegroundColor Green
            }
        }
    } else {
        Write-Host "✅ Aucun conteneur LibreSpeed existant" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt des conteneurs: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 3. Création du réseau Docker
Write-Host "`n3. Création du réseau Docker..." -ForegroundColor Yellow
try {
    $networkExists = docker network ls --filter "name=iahome-network" --format "{{.Name}}"
    if ($networkExists -eq "iahome-network") {
        Write-Host "✅ Réseau iahome-network existe déjà" -ForegroundColor Green
    } else {
        Write-Host "📦 Création du réseau iahome-network..." -ForegroundColor Yellow
        docker network create iahome-network
        Write-Host "✅ Réseau iahome-network créé" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur réseau: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Démarrage de LibreSpeed
Write-Host "`n4. Démarrage de LibreSpeed..." -ForegroundColor Yellow
try {
    Write-Host "📦 Démarrage de LibreSpeed depuis essentiels/librespeed..." -ForegroundColor Yellow
    Set-Location "essentiels/librespeed"
    docker-compose up -d
    Write-Host "✅ LibreSpeed démarré avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage de LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
} finally {
    Set-Location "../.."
}

# 5. Vérification du statut
Write-Host "`n5. Vérification du statut..." -ForegroundColor Yellow
Start-Sleep -Seconds 5
try {
    $containerStatus = docker ps --filter "name=librespeed-essentiels" --format "{{.Status}}"
    if ($containerStatus) {
        Write-Host "✅ Conteneur LibreSpeed: $containerStatus" -ForegroundColor Green
    } else {
        Write-Host "❌ Conteneur LibreSpeed non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 6. Test de l'accès local
Write-Host "`n6. Test de l'accès local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed accessible localement sur http://localhost:8083" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed non accessible localement (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur d'accès local: $($_.Exception.Message)" -ForegroundColor Red
}

# 7. Résumé
Write-Host "`n7. RÉSUMÉ" -ForegroundColor Yellow
Write-Host "=========" -ForegroundColor Yellow

Write-Host "`n✅ LIBRESPEED DÉMARRÉ DANS ESSENTIELS !" -ForegroundColor Green
Write-Host "📁 Dossier: essentiels/librespeed/" -ForegroundColor White
Write-Host "🐳 Conteneur: librespeed-essentiels" -ForegroundColor White
Write-Host "🌐 Port local: http://localhost:8083" -ForegroundColor White
Write-Host "🔗 URL publique: https://librespeed.iahome.fr" -ForegroundColor White

Write-Host "`n📋 Commandes utiles:" -ForegroundColor Cyan
Write-Host "• Arrêter: docker stop librespeed-essentiels" -ForegroundColor White
Write-Host "• Redémarrer: docker restart librespeed-essentiels" -ForegroundColor White
Write-Host "• Logs: docker logs librespeed-essentiels" -ForegroundColor White
Write-Host "• Statut: docker ps --filter name=librespeed-essentiels" -ForegroundColor White

Write-Host "`n🎯 LibreSpeed est maintenant organisé dans le dossier essentiels !" -ForegroundColor Green









