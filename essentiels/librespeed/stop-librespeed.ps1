# Script d'arrêt de LibreSpeed dans le dossier essentiels
Write-Host "🛑 ARRÊT LIBRESPEED ESSENTIELS" -ForegroundColor Red
Write-Host "=============================" -ForegroundColor Red

# 1. Arrêt du conteneur
Write-Host "`n1. Arrêt du conteneur LibreSpeed..." -ForegroundColor Yellow
try {
    $containerStatus = docker ps --filter "name=librespeed-essentiels" --format "{{.Names}}"
    if ($containerStatus) {
        Write-Host "📦 Arrêt du conteneur librespeed-essentiels..." -ForegroundColor Yellow
        docker stop librespeed-essentiels
        Write-Host "✅ Conteneur arrêté" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Conteneur librespeed-essentiels non trouvé" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Suppression du conteneur
Write-Host "`n2. Suppression du conteneur..." -ForegroundColor Yellow
try {
    $containerExists = docker ps -a --filter "name=librespeed-essentiels" --format "{{.Names}}"
    if ($containerExists) {
        Write-Host "📦 Suppression du conteneur librespeed-essentiels..." -ForegroundColor Yellow
        docker rm librespeed-essentiels
        Write-Host "✅ Conteneur supprimé" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Conteneur librespeed-essentiels non trouvé" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors de la suppression: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Vérification
Write-Host "`n3. Vérification..." -ForegroundColor Yellow
try {
    $remainingContainers = docker ps -a --filter "name=librespeed" --format "{{.Names}}"
    if ($remainingContainers) {
        Write-Host "⚠️ Conteneurs LibreSpeed restants: $remainingContainers" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Aucun conteneur LibreSpeed restant" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Résumé
Write-Host "`n4. RÉSUMÉ" -ForegroundColor Yellow
Write-Host "=========" -ForegroundColor Yellow

Write-Host "`n✅ LIBRESPEED ARRÊTÉ !" -ForegroundColor Green
Write-Host "📁 Dossier: essentiels/librespeed/" -ForegroundColor White
Write-Host "🐳 Conteneur: librespeed-essentiels (arrêté)" -ForegroundColor White

Write-Host "`n📋 Pour redémarrer:" -ForegroundColor Cyan
Write-Host "• .\start-librespeed.ps1" -ForegroundColor White
Write-Host "• docker-compose up -d (depuis essentiels/librespeed/)" -ForegroundColor White

Write-Host "`n🎯 LibreSpeed a été arrêté proprement !" -ForegroundColor Green








