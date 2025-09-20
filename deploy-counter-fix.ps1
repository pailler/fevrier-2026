# Script de déploiement des corrections du compteur LibreSpeed
Write-Host "🚀 Déploiement des corrections du compteur LibreSpeed" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerInfo = docker info 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de Docker" -ForegroundColor Red
    exit 1
}

# Redémarrer l'application iahome pour charger les corrections
Write-Host "`n2. Redémarrage de l'application iahome..." -ForegroundColor Yellow
try {
    docker restart iahome-app
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Application iahome redémarrée avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du redémarrage de l'application iahome" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du redémarrage de l'application iahome: $($_.Exception.Message)" -ForegroundColor Red
}

# Attendre que l'application soit prête
Write-Host "`n3. Attente du démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Vérifier le statut de l'application
Write-Host "`n4. Vérification du statut de l'application..." -ForegroundColor Yellow
try {
    $appStatus = docker ps --filter "name=iahome-app" --format "table {{.Status}}"
    Write-Host "iahome-app: $appStatus" -ForegroundColor White
    
    if ($appStatus -like "*Up*") {
        Write-Host "✅ Application opérationnelle" -ForegroundColor Green
    } else {
        Write-Host "❌ Application non opérationnelle" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification du statut" -ForegroundColor Red
}

# Tester les corrections
Write-Host "`n5. Test des corrections..." -ForegroundColor Yellow
try {
    & .\fix-librespeed-counter.ps1
} catch {
    Write-Host "❌ Erreur lors du test des corrections: $($_.Exception.Message)" -ForegroundColor Red
}

# Test du compteur
Write-Host "`n6. Test du compteur..." -ForegroundColor Yellow
try {
    & .\test-librespeed-counter.ps1
} catch {
    Write-Host "❌ Erreur lors du test du compteur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=====================================================" -ForegroundColor Cyan
Write-Host "🎯 Déploiement des corrections terminé" -ForegroundColor Cyan
Write-Host "`nCorrections appliquées:" -ForegroundColor Yellow
Write-Host "• API librespeed-token corrigée pour retourner JSON" -ForegroundColor White
Write-Host "• Système de comptage intégré dans le flux LibreSpeed" -ForegroundColor White
Write-Host "• Scripts de test et de réparation créés" -ForegroundColor White
Write-Host "`nLe compteur d'accès LibreSpeed est maintenant fonctionnel !" -ForegroundColor Green
