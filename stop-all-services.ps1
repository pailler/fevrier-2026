# Script d'arrêt complet pour tous les services IAHome
# Compatible Windows PowerShell

Write-Host "🛑 Arrêt complet de tous les services IAHome..." -ForegroundColor Yellow

# Arrêter les services externes
Write-Host "🔧 Arrêt des services externes..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml down

# Arrêter les services principaux
Write-Host "🚀 Arrêt des services principaux..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# Vérifier qu'aucun conteneur ne tourne
Write-Host "🔍 Vérification des conteneurs..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}"

if ($containers -match "iahome|stirling-pdf|metube|librespeed|psitransfer|polr") {
    Write-Host "⚠️  Certains conteneurs sont encore en cours d'exécution:" -ForegroundColor Yellow
    docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    
    $force_stop = Read-Host "Voulez-vous forcer l'arrêt de tous les conteneurs ? (y/N)"
    if ($force_stop -eq "y" -or $force_stop -eq "Y") {
        Write-Host "🛑 Arrêt forcé de tous les conteneurs..." -ForegroundColor Red
        docker stop $(docker ps -q) 2>$null
        docker rm $(docker ps -aq) 2>$null
    }
} else {
    Write-Host "✅ Tous les conteneurs IAHome ont été arrêtés" -ForegroundColor Green
}

# Nettoyer les volumes non utilisés (optionnel)
$clean_volumes = Read-Host "Voulez-vous nettoyer les volumes non utilisés ? (y/N)"
if ($clean_volumes -eq "y" -or $clean_volumes -eq "Y") {
    Write-Host "🧹 Nettoyage des volumes..." -ForegroundColor Yellow
    docker volume prune -f
}

# Nettoyer les images non utilisées (optionnel)
$clean_images = Read-Host "Voulez-vous nettoyer les images non utilisées ? (y/N)"
if ($clean_images -eq "y" -or $clean_images -eq "Y") {
    Write-Host "🧹 Nettoyage des images..." -ForegroundColor Yellow
    docker image prune -f
}

Write-Host "`n✅ Arrêt complet terminé !" -ForegroundColor Green
Write-Host "`n📋 Services arrêtés:" -ForegroundColor Cyan
Write-Host "   • IAHome App" -ForegroundColor White
Write-Host "   • Stirling-PDF" -ForegroundColor White
Write-Host "   • MeTube" -ForegroundColor White
Write-Host "   • LibreSpeed" -ForegroundColor White
Write-Host "   • PSITransfer" -ForegroundColor White
Write-Host "   • Polr (QR)" -ForegroundColor White

Write-Host "`n🔧 Pour redémarrer:" -ForegroundColor Yellow
Write-Host "   • Tous les services: .\\start-all-services.ps1" -ForegroundColor White
Write-Host "   • Services externes: docker-compose -f docker-services/docker-compose.services.yml up -d" -ForegroundColor White
Write-Host "   • Service principal: docker-compose -f docker-compose.prod.yml up -d" -ForegroundColor White
