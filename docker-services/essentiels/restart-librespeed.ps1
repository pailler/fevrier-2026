# Script pour redémarrer LibreSpeed depuis le dossier essentiels
Write-Host "🔄 Redémarrage de LibreSpeed (Essentiels)" -ForegroundColor Magenta
Write-Host "=========================================" -ForegroundColor Magenta

# Arrêter les services
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
try {
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Services arrêtés" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Aucun service en cours d'exécution" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Red
}

# Attendre un peu
Write-Host "`n2. Attente..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Redémarrer les services
Write-Host "`n3. Redémarrage des services..." -ForegroundColor Yellow
try {
    docker-compose up -d
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Services redémarrés avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du redémarrage" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du redémarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Vérifier le statut
Write-Host "`n4. Vérification du statut..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $containers = docker ps --filter name=librespeed --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "   📊 Statut des containers LibreSpeed:" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 LibreSpeed redémarré depuis le dossier essentiels !" -ForegroundColor Green
Write-Host "   🌐 LibreSpeed: https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "   🔐 LibreSpeed Auth: https://librespeed.iahome.fr/auth" -ForegroundColor Cyan



