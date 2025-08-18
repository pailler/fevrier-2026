# Script de mise à jour des services Docker IAHome
# Usage: .\update-services.ps1 [service_name]

param(
    [string]$Service = "all"
)

Write-Host "🔄 Mise à jour des services Docker IAHome..." -ForegroundColor Blue

# Vérifier si Docker est en cours d'exécution
try {
    docker version | Out-Null
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Chemin vers le fichier docker-compose
$ComposeFile = "docker-compose.services.yml"

Write-Host "📥 Téléchargement des dernières images..." -ForegroundColor Yellow

if ($Service -eq "all") {
    docker-compose -f $ComposeFile pull
    Write-Host "✅ Toutes les images ont été mises à jour!" -ForegroundColor Green
    
    Write-Host "🔄 Redémarrage des services avec les nouvelles images..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile up -d
} else {
    docker-compose -f $ComposeFile pull $Service
    Write-Host "✅ Image du service $Service mise à jour!" -ForegroundColor Green
    
    Write-Host "🔄 Redémarrage du service $Service..." -ForegroundColor Yellow
    docker-compose -f $ComposeFile up -d $Service
}

Write-Host ""
Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f $ComposeFile ps

Write-Host ""
Write-Host "🧹 Nettoyage des images non utilisées..." -ForegroundColor Yellow
docker image prune -f

Write-Host ""
Write-Host "✅ Mise à jour terminée!" -ForegroundColor Green
Write-Host "📝 Pour voir les logs: docker-compose -f $ComposeFile logs -f [service_name]" -ForegroundColor Gray


