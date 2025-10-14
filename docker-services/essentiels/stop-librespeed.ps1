# Script pour arrêter LibreSpeed depuis le dossier essentiels
Write-Host "🛑 Arrêt de LibreSpeed (Essentiels)" -ForegroundColor Red
Write-Host "===================================" -ForegroundColor Red

# Arrêter les services LibreSpeed
Write-Host "`n1. Arrêt des services LibreSpeed..." -ForegroundColor Yellow
try {
    docker-compose down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Services LibreSpeed arrêtés avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Aucun service LibreSpeed en cours d'exécution" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Red
}

# Vérifier le statut des containers
Write-Host "`n2. Vérification du statut des containers..." -ForegroundColor Yellow
try {
    $containers = docker ps -a --filter name=librespeed --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers -match "librespeed") {
        Write-Host "   📊 Containers LibreSpeed restants:" -ForegroundColor Cyan
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "   ✅ Aucun container LibreSpeed en cours d'exécution" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 LibreSpeed arrêté depuis le dossier essentiels !" -ForegroundColor Green






