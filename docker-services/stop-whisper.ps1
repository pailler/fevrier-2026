# Script PowerShell pour arrêter le service Whisper IA

Write-Host "🛑 Arrêt du service Whisper IA..." -ForegroundColor Red
Write-Host "=================================" -ForegroundColor Red

# Aller dans le répertoire des services
Set-Location -Path "docker-services"

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
$confirmation = Read-Host "Êtes-vous sûr de vouloir arrêter le service Whisper IA ? (y/N)"
if ($confirmation -ne 'y' -and $confirmation -ne 'Y' -and $confirmation -ne 'yes' -and $confirmation -ne 'Yes') {
    Write-Host "❌ Arrêt annulé." -ForegroundColor Yellow
    exit 0
}

# Arrêter le service Whisper
Write-Host "🔄 Arrêt des containers Whisper..." -ForegroundColor Yellow
Write-Host "   - Arrêt de whisper-api..." -ForegroundColor Gray
Write-Host "   - Arrêt de whisper-webui..." -ForegroundColor Gray
Write-Host "   - Arrêt de whisper-cloudflared..." -ForegroundColor Gray

try {
    docker-compose -f docker-compose.whisper.yml down
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Service Whisper IA arrêté avec succès !" -ForegroundColor Green
    } else {
        throw "Erreur lors de l'arrêt des containers"
    }
} catch {
    Write-Host "❌ Erreur lors de l'arrêt des containers : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Essayez de forcer l'arrêt avec : docker-compose -f docker-compose.whisper.yml down --remove-orphans" -ForegroundColor Gray
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

Write-Host ""
Write-Host "📋 Commandes utiles :" -ForegroundColor Yellow
Write-Host "   - Redémarrer : .\start-whisper.ps1" -ForegroundColor Gray
Write-Host "   - Nettoyer : docker-compose -f docker-compose.whisper.yml down --volumes --remove-orphans" -ForegroundColor Gray
Write-Host "   - Voir les logs : docker-compose -f docker-compose.whisper.yml logs" -ForegroundColor Gray
Write-Host ""
Write-Host "🗑️  Pour supprimer complètement les données :" -ForegroundColor Red
Write-Host "   docker volume rm docker-services_whisper-models" -ForegroundColor Gray
Write-Host "   docker volume rm docker-services_whisper-uploads" -ForegroundColor Gray
Write-Host "   docker volume rm docker-services_whisper-outputs" -ForegroundColor Gray
