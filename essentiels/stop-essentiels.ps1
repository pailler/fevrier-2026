# Script pour arrêter tous les services essentiels
Write-Host "🛑 Arrêt des services essentiels" -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Arrêter tous les containers essentiels
$containers = @("librespeed", "metube", "pdf", "psitransfer", "qrcodes")
foreach ($container in $containers) {
    Write-Host "`n🛑 Arrêt de $container..." -ForegroundColor Yellow
    docker stop $container 2>$null
    docker rm $container 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ $container arrêté et supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  $container n'était pas en cours d'exécution" -ForegroundColor Yellow
    }
}

Write-Host "`n🎯 Tous les services essentiels arrêtés !" -ForegroundColor Green