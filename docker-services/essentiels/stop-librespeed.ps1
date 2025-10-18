# Script pour arrêter LibreSpeed
Write-Host "🛑 Arrêt de LibreSpeed" -ForegroundColor Red
Write-Host "=====================" -ForegroundColor Red

# Arrêter le container LibreSpeed
Write-Host "`n1. Arrêt du container LibreSpeed..." -ForegroundColor Yellow
$containerName = "librespeed-prod"
$containerExists = docker ps -a --filter name=$containerName --format "{{.Names}}" 2>$null

if ($containerExists -eq $containerName) {
    Write-Host "   🛑 Arrêt de $containerName..." -ForegroundColor Yellow
    docker stop $containerName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $containerName arrêté" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'arrêt de $containerName" -ForegroundColor Red
    }
    
    Write-Host "   🗑️  Suppression de $containerName..." -ForegroundColor Yellow
    docker rm $containerName
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $containerName supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de la suppression de $containerName" -ForegroundColor Red
    }
} else {
    Write-Host "   ℹ️  Le container $containerName n'existe pas" -ForegroundColor Blue
}

# Vérifier le statut final
Write-Host "`n2. Vérification du statut final..." -ForegroundColor Yellow
try {
    $containers = docker ps -a --filter name=librespeed --format "table {{.Names}}\t{{.Status}}"
    if ($containers -match "librespeed") {
        Write-Host "   📊 Containers LibreSpeed restants:" -ForegroundColor Cyan
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "   ✅ Aucun container LibreSpeed en cours d'exécution" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification du statut" -ForegroundColor Yellow
}

Write-Host "`n🎯 LibreSpeed arrêté avec succès !" -ForegroundColor Green