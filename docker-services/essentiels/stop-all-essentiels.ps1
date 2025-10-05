# Script pour arrêter tous les services essentiels
Write-Host "🛑 Arrêt de tous les services essentiels" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Red

# Arrêter tous les services
$services = @("librespeed", "metube", "pdf", "psitransfer", "qrcodes")

foreach ($service in $services) {
    Write-Host "`n🛑 Arrêt de $service..." -ForegroundColor Yellow
    docker-compose -f $service/docker-compose.yml down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $service arrêté" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $service n'était pas en cours d'exécution" -ForegroundColor Yellow
    }
}

# Vérifier le statut final
Write-Host "`n📊 Vérification du statut final..." -ForegroundColor Yellow
try {
    $containers = docker ps -a --filter name=iahome --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($containers -match "iahome") {
        Write-Host "   📊 Containers essentiels restants:" -ForegroundColor Cyan
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "   ✅ Aucun container essentiel en cours d'exécution" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️  Erreur lors de la vérification" -ForegroundColor Yellow
}

Write-Host "`n🎯 Tous les services essentiels arrêtés !" -ForegroundColor Green
