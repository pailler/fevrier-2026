# Script pour nettoyer les sessions et données MeTube après chaque utilisation
# Ce script supprime les fichiers téléchargés, l'historique et les sessions

Write-Host "🧹 Nettoyage des sessions et données MeTube" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Vérifier que le conteneur est en cours d'exécution
$containerStatus = docker ps --filter name=metube-iahome --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "❌ Le conteneur MeTube n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

Write-Host "`n📋 Étape 1 : Nettoyage de l'historique des téléchargements..." -ForegroundColor Yellow

# Nettoyer les fichiers de base de données MeTube (completed, pending, queue)
Write-Host "   Suppression des fichiers de session..." -ForegroundColor Gray
docker exec metube-iahome sh -c "rm -f /downloads/.metube/completed /downloads/.metube/pending /downloads/.metube/queue" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Fichiers de session supprimés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Erreur lors de la suppression des fichiers de session" -ForegroundColor Yellow
}

Write-Host "`n📋 Étape 2 : Nettoyage des fichiers téléchargés..." -ForegroundColor Yellow

# Nettoyer les fichiers téléchargés (garder seulement les 10 derniers fichiers ou tout supprimer)
$cleanupMode = Read-Host "Voulez-vous supprimer TOUS les fichiers téléchargés ? (O/N) [N]"
if ($cleanupMode -eq "O" -or $cleanupMode -eq "o" -or $cleanupMode -eq "Y" -or $cleanupMode -eq "y") {
    Write-Host "   Suppression de tous les fichiers téléchargés..." -ForegroundColor Gray
    docker exec metube-iahome sh -c "find /downloads -type f ! -path '/downloads/.metube/*' -delete" 2>&1 | Out-Null
    Write-Host "   ✅ Tous les fichiers téléchargés supprimés" -ForegroundColor Green
} else {
    Write-Host "   Conservation des fichiers téléchargés" -ForegroundColor Gray
    Write-Host "   💡 Pour supprimer tous les fichiers, exécutez ce script avec 'O' à l'étape 2" -ForegroundColor Yellow
}

Write-Host "`n📋 Étape 3 : Nettoyage des fichiers temporaires..." -ForegroundColor Yellow

# Nettoyer les fichiers temporaires
Write-Host "   Suppression des fichiers temporaires..." -ForegroundColor Gray
docker exec metube-iahome sh -c "rm -rf /downloads/.metube/tmp/* /tmp/metube-* 2>/dev/null" 2>&1 | Out-Null
Write-Host "   ✅ Fichiers temporaires supprimés" -ForegroundColor Green

Write-Host "`n✅ Nettoyage terminé !" -ForegroundColor Green

Write-Host "`n📊 Espace disque libéré:" -ForegroundColor Cyan
docker exec metube-iahome sh -c "df -h /downloads" 2>&1

Write-Host "`n💡 Pour automatiser ce nettoyage, configurez un cron job ou un script planifié" -ForegroundColor Yellow










