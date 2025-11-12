# Script pour nettoyer automatiquement les sessions MeTube après chaque téléchargement
# Ce script peut être appelé via l'API ou un webhook après chaque téléchargement

param(
    [switch]$FullCleanup = $false  # Si activé, supprime aussi les fichiers téléchargés
)

Write-Host "🧹 Nettoyage automatique des sessions MeTube" -ForegroundColor Cyan

# Vérifier que le conteneur est en cours d'exécution
$containerStatus = docker ps --filter name=metube-iahome --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "❌ Le conteneur MeTube n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Nettoyer les fichiers de session MeTube
Write-Host "`n📋 Nettoyage des fichiers de session..." -ForegroundColor Yellow
docker exec metube-iahome sh -c "rm -f /downloads/.metube/completed /downloads/.metube/pending /downloads/.metube/queue" 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "   ✅ Fichiers de session supprimés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Erreur lors de la suppression des fichiers de session" -ForegroundColor Yellow
}

# Nettoyer les fichiers temporaires
Write-Host "`n📋 Nettoyage des fichiers temporaires..." -ForegroundColor Yellow
docker exec metube-iahome sh -c "rm -rf /downloads/.metube/tmp/* /tmp/metube-* 2>/dev/null" 2>&1 | Out-Null
Write-Host "   ✅ Fichiers temporaires supprimés" -ForegroundColor Green

# Nettoyage complet si demandé
if ($FullCleanup) {
    Write-Host "`n📋 Nettoyage complet des fichiers téléchargés..." -ForegroundColor Yellow
    docker exec metube-iahome sh -c "find /downloads -type f ! -path '/downloads/.metube/*' -delete" 2>&1 | Out-Null
    Write-Host "   ✅ Tous les fichiers téléchargés supprimés" -ForegroundColor Green
}

Write-Host "`n✅ Nettoyage terminé !" -ForegroundColor Green







