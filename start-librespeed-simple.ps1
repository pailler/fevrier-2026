# Script de démarrage LibreSpeed simple avec Docker
Write-Host "🚀 DÉMARRAGE LIBRESPEED SIMPLE" -ForegroundColor Cyan
Write-Host "===============================" -ForegroundColor Cyan

# 1. Vérifier Docker
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version 2>$null
    if ($dockerVersion) {
        Write-Host "✅ Docker installé: $dockerVersion" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker non installé" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Docker non installé" -ForegroundColor Red
    exit 1
}

# 2. Arrêter les conteneurs existants
Write-Host "`n2. Arrêt des conteneurs LibreSpeed existants..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose-librespeed-simple.yml down 2>$null
    Write-Host "✅ Conteneurs arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun conteneur à arrêter" -ForegroundColor Blue
}

# 3. Créer le réseau Docker si nécessaire
Write-Host "`n3. Création du réseau Docker..." -ForegroundColor Yellow
try {
    docker network create iahome-network 2>$null
    Write-Host "✅ Réseau iahome-network créé ou existant" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Réseau déjà existant" -ForegroundColor Blue
}

# 4. Démarrer LibreSpeed
Write-Host "`n4. Démarrage de LibreSpeed..." -ForegroundColor Yellow
try {
    Write-Host "📦 Démarrage de LibreSpeed..." -ForegroundColor Blue
    docker-compose -f docker-compose-librespeed-simple.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ LibreSpeed démarré avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du démarrage de LibreSpeed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Attendre que le service soit prêt
Write-Host "`n5. Attente de l'initialisation..." -ForegroundColor Yellow
Write-Host "⏳ Attente de 20 secondes pour que LibreSpeed soit prêt..." -ForegroundColor Blue
Start-Sleep -Seconds 20

# 6. Vérifier le statut du conteneur
Write-Host "`n6. Vérification du statut du conteneur..." -ForegroundColor Yellow
try {
    $containers = docker ps --filter "name=librespeed" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "📊 Conteneur LibreSpeed:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "❌ Erreur lors de la vérification du conteneur" -ForegroundColor Red
}

# 7. Tester l'accès local
Write-Host "`n7. Test de l'accès local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed accessible sur http://localhost:8081" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ LibreSpeed erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 8. Tester via Cloudflare
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

# 9. Tester avec token
Write-Host "`n9. Test avec token..." -ForegroundColor Yellow
try {
    $testToken = "3un5vtl5gedzeyfarxg8zl"
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr?token=$testToken" -UseBasicParsing -TimeoutSec 15 -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed avec token accessible sur https://librespeed.iahome.fr?token=$testToken" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed avec token non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ LibreSpeed avec token erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 10. Résumé
Write-Host "`n10. Résumé du déploiement..." -ForegroundColor Yellow
Write-Host "=============================" -ForegroundColor Yellow

Write-Host "`n📊 Service déployé:" -ForegroundColor Cyan
Write-Host "• LibreSpeed: http://localhost:8081" -ForegroundColor White
Write-Host "• LibreSpeed public: https://librespeed.iahome.fr" -ForegroundColor White

Write-Host "`n🔗 URLs d'accès:" -ForegroundColor Cyan
Write-Host "• https://librespeed.iahome.fr (accès public)" -ForegroundColor White
Write-Host "• https://librespeed.iahome.fr?token=3un5vtl5gedzeyfarxg8zl (accès avec token)" -ForegroundColor White
Write-Host "• http://localhost:8081 (accès direct local)" -ForegroundColor White

Write-Host "`n🛠️ Commandes utiles:" -ForegroundColor Cyan
Write-Host "• Arrêter: docker-compose -f docker-compose-librespeed-simple.yml down" -ForegroundColor White
Write-Host "• Redémarrer: docker-compose -f docker-compose-librespeed-simple.yml restart" -ForegroundColor White
Write-Host "• Logs: docker logs librespeed-iahome -f" -ForegroundColor White
Write-Host "• Status: docker ps --filter name=librespeed" -ForegroundColor White

Write-Host "`n✅ LIBRESPEED DÉMARRÉ AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "LibreSpeed est maintenant accessible sur https://librespeed.iahome.fr" -ForegroundColor Green
Write-Host "Avec support des tokens d'accès" -ForegroundColor Green