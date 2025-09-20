# Script de déploiement de la sécurisation LibreSpeed
Write-Host "🚀 Déploiement de la sécurisation LibreSpeed" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

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

# Redémarrer Traefik pour charger les nouvelles configurations
Write-Host "`n2. Redémarrage de Traefik..." -ForegroundColor Yellow
try {
    docker restart traefik
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Traefik redémarré avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du redémarrage de Traefik" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du redémarrage de Traefik: $($_.Exception.Message)" -ForegroundColor Red
}

# Redémarrer l'application iahome pour charger les nouvelles APIs
Write-Host "`n3. Redémarrage de l'application iahome..." -ForegroundColor Yellow
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

# Attendre que les services soient prêts
Write-Host "`n4. Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut des services
Write-Host "`n5. Vérification du statut des services..." -ForegroundColor Yellow
try {
    $traefikStatus = docker ps --filter "name=traefik" --format "table {{.Status}}"
    $appStatus = docker ps --filter "name=iahome-app" --format "table {{.Status}}"
    
    Write-Host "Traefik: $traefikStatus" -ForegroundColor White
    Write-Host "iahome-app: $appStatus" -ForegroundColor White
    
    if ($traefikStatus -like "*Up*" -and $appStatus -like "*Up*") {
        Write-Host "✅ Tous les services sont opérationnels" -ForegroundColor Green
    } else {
        Write-Host "❌ Certains services ne sont pas opérationnels" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification du statut des services" -ForegroundColor Red
}

# Tester la configuration
Write-Host "`n6. Test de la configuration..." -ForegroundColor Yellow
try {
    & .\test-librespeed-security.ps1
} catch {
    Write-Host "❌ Erreur lors du test de la configuration: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n=============================================" -ForegroundColor Cyan
Write-Host "🎯 Déploiement de la sécurisation terminé" -ForegroundColor Cyan
Write-Host "`nConfiguration appliquée:" -ForegroundColor Yellow
Write-Host "• Accès direct à librespeed.iahome.fr BLOQUÉ" -ForegroundColor White
Write-Host "• Redirection vers iahome.fr/api/redirect-librespeed" -ForegroundColor White
Write-Host "• Authentification via système de tokens existant" -ForegroundColor White
Write-Host "• Vérification des modules activés dans /encours" -ForegroundColor White
Write-Host "• Page de blocage personnalisée pour les accès non autorisés" -ForegroundColor White
