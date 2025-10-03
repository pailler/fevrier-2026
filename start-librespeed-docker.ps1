# Script de démarrage LibreSpeed avec Docker
Write-Host "🚀 DÉMARRAGE LIBRESPEED DOCKER" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# 1. Vérifier Docker
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker installé: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker non installé" -ForegroundColor Red
        Write-Host "⚠️ Installez Docker Desktop depuis https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "❌ Docker non installé" -ForegroundColor Red
    exit 1
}

# 2. Vérifier Docker Compose
try {
    $composeVersion = docker-compose --version 2>$null
    if ($composeVersion) {
        Write-Host "✅ Docker Compose installé: $composeVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker Compose non installé" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker Compose non installé" -ForegroundColor Red
    exit 1
}

# 3. Arrêter les conteneurs existants
Write-Host "`n2. Arrêt des conteneurs LibreSpeed existants..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose-librespeed.yml down 2>$null
    Write-Host "✅ Conteneurs arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun conteneur à arrêter" -ForegroundColor Blue
}

# 4. Créer le réseau Docker si nécessaire
Write-Host "`n3. Création du réseau Docker..." -ForegroundColor Yellow
try {
    docker network create iahome-network 2>$null
    Write-Host "✅ Réseau iahome-network créé ou existant" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Réseau déjà existant" -ForegroundColor Blue
}

# 5. Construire et démarrer les services
Write-Host "`n4. Démarrage des services LibreSpeed..." -ForegroundColor Yellow
try {
    Write-Host "📦 Démarrage de LibreSpeed..." -ForegroundColor Blue
    docker-compose -f docker-compose-librespeed.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services LibreSpeed démarrés avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du démarrage des services" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Attendre que les services soient prêts
Write-Host "`n5. Attente de l'initialisation..." -ForegroundColor Yellow
Write-Host "⏳ Attente de 30 secondes pour que les services soient prêts..." -ForegroundColor Blue
Start-Sleep -Seconds 30

# 7. Vérifier le statut des conteneurs
Write-Host "`n6. Vérification du statut des conteneurs..." -ForegroundColor Yellow
try {
    $containers = docker ps --filter "name=librespeed" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "📊 Conteneurs LibreSpeed:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "❌ Erreur lors de la vérification des conteneurs" -ForegroundColor Red
}

# 8. Tester l'accès aux services
Write-Host "`n7. Test de l'accès aux services..." -ForegroundColor Yellow

# Test LibreSpeed principal
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed principal accessible sur http://localhost:8081" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed principal non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ LibreSpeed principal erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test proxy d'authentification
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Proxy d'authentification accessible sur http://localhost:8083" -ForegroundColor Green
    } else {
        Write-Host "❌ Proxy d'authentification non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Proxy d'authentification erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Tester via Cloudflare
Write-Host "`n8. Test via Cloudflare..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -UseBasicParsing -TimeoutSec 15 -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed accessible via https://librespeed.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed non accessible via Cloudflare (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ LibreSpeed via Cloudflare erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Résumé
Write-Host "`n9. Résumé du déploiement..." -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

Write-Host "`n📊 Services déployés:" -ForegroundColor Cyan
Write-Host "• LibreSpeed principal: http://localhost:8081" -ForegroundColor White
Write-Host "• Proxy d'authentification: http://localhost:8083" -ForegroundColor White
Write-Host "• LibreSpeed public: https://librespeed.iahome.fr" -ForegroundColor White

Write-Host "`n🔗 URLs d'accès:" -ForegroundColor Cyan
Write-Host "• https://librespeed.iahome.fr (accès public)" -ForegroundColor White
Write-Host "• https://librespeed.iahome.fr?token=VOTRE_TOKEN (accès avec token)" -ForegroundColor White
Write-Host "• http://localhost:8081 (accès direct local)" -ForegroundColor White

Write-Host "`n🛠️ Commandes utiles:" -ForegroundColor Cyan
Write-Host "• Arrêter: docker-compose -f docker-compose-librespeed.yml down" -ForegroundColor White
Write-Host "• Redémarrer: docker-compose -f docker-compose-librespeed.yml restart" -ForegroundColor White
Write-Host "• Logs: docker-compose -f docker-compose-librespeed.yml logs -f" -ForegroundColor White
Write-Host "• Status: docker ps --filter name=librespeed" -ForegroundColor White

Write-Host "`n✅ LIBRESPEED DOCKER DÉMARRÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "LibreSpeed est maintenant accessible sur https://librespeed.iahome.fr" -ForegroundColor Green
Write-Host "Avec authentification par token intégrée" -ForegroundColor Green

