# Script PowerShell pour arrêter Whisper IA en mode PRODUCTION

Write-Host "🛑 ARRÊT WHISPER IA - MODE PRODUCTION" -ForegroundColor Red
Write-Host "=====================================" -ForegroundColor Red

# Aller dans le répertoire des services
Set-Location -Path "essentiels"

Write-Host "📁 Répertoire de travail : $(Get-Location)" -ForegroundColor Gray

# Vérifier si le fichier docker-compose existe
if (!(Test-Path "docker-compose.whisper.yml")) {
    Write-Host "❌ Fichier docker-compose.whisper.yml introuvable !" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le bon répertoire." -ForegroundColor Gray
    exit 1
}

# Afficher le statut avant arrêt
Write-Host "📊 Statut des services avant arrêt :" -ForegroundColor Yellow
docker-compose -f docker-compose.whisper.yml ps

Write-Host ""

# Demander confirmation
Write-Host "⚠️  ATTENTION : Vous êtes sur le point d'arrêter le service Whisper IA en mode production." -ForegroundColor Yellow
Write-Host "   Cela va interrompre tous les services de transcription." -ForegroundColor Gray
Write-Host ""
$confirmation = Read-Host "Êtes-vous sûr de vouloir arrêter le service ? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y' -and $confirmation -ne 'yes' -and $confirmation -ne 'Yes') {
    Write-Host "❌ Arrêt annulé." -ForegroundColor Yellow
    exit 0
}

# Arrêter les services de production
Write-Host "🔄 Arrêt des services de production..." -ForegroundColor Yellow
Write-Host "   • Arrêt de whisper-api-prod..." -ForegroundColor Gray
Write-Host "   • Arrêt de whisper-webui-prod..." -ForegroundColor Gray
Write-Host "   • Arrêt de whisper-cloudflared-prod..." -ForegroundColor Gray

try {
    # Arrêt avec suppression des containers orphelins
    docker-compose -f docker-compose.whisper.yml down --remove-orphans
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services arrêtés avec succès !" -ForegroundColor Green
    } else {
        throw "Erreur lors de l'arrêt des services"
    }
} catch {
    Write-Host "❌ Erreur lors de l'arrêt : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Forcez l'arrêt avec : docker-compose -f docker-compose.whisper.yml down --remove-orphans --volumes" -ForegroundColor Gray
    exit 1
}

# Vérifier que les containers sont bien arrêtés
Write-Host "📊 Vérification de l'arrêt des services..." -ForegroundColor Yellow
$runningContainers = docker ps --filter "name=whisper" --format "{{.Names}}"

if ($runningContainers) {
    Write-Host "⚠️  Certains containers Whisper sont encore en cours d'exécution :" -ForegroundColor Yellow
    Write-Host $runningContainers -ForegroundColor Gray
    Write-Host "💡 Forcez l'arrêt avec : docker stop $($runningContainers -join ' ')" -ForegroundColor Gray
} else {
    Write-Host "✅ Tous les containers Whisper sont arrêtés." -ForegroundColor Green
}

# Nettoyage optionnel
Write-Host ""
Write-Host "🧹 Nettoyage optionnel :" -ForegroundColor Cyan
Write-Host "   • Images non utilisées : docker image prune -f" -ForegroundColor Gray
Write-Host "   • Volumes non utilisés : docker volume prune -f" -ForegroundColor Gray
Write-Host "   • Réseaux non utilisés : docker network prune -f" -ForegroundColor Gray

$cleanup = Read-Host "Voulez-vous effectuer un nettoyage ? (y/N)"
if ($cleanup -eq 'y' -or $cleanup -eq 'Y' -or $cleanup -eq 'yes' -or $cleanup -eq 'Yes') {
    Write-Host "🧹 Nettoyage en cours..." -ForegroundColor Yellow
    docker image prune -f | Out-Null
    docker volume prune -f | Out-Null
    docker network prune -f | Out-Null
    Write-Host "✅ Nettoyage terminé !" -ForegroundColor Green
}

Write-Host ""
Write-Host "📋 COMMANDES UTILES :" -ForegroundColor Yellow
Write-Host "   • Redémarrer : .\start-whisper-production.ps1" -ForegroundColor Gray
Write-Host "   • Voir les logs : docker-compose -f docker-compose.whisper.yml logs" -ForegroundColor Gray
Write-Host "   • Nettoyer complètement : docker-compose -f docker-compose.whisper.yml down --volumes --remove-orphans" -ForegroundColor Gray
Write-Host ""
Write-Host "🗑️  SUPPRESSION COMPLÈTE DES DONNÉES :" -ForegroundColor Red
Write-Host "   docker volume rm essentiels_whisper-models" -ForegroundColor Gray
Write-Host "   docker volume rm essentiels_whisper-uploads" -ForegroundColor Gray
Write-Host "   docker volume rm essentiels_whisper-outputs" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Service Whisper IA arrêté en mode production !" -ForegroundColor Green

