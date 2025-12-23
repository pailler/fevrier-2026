# Script de démarrage Docker Compose avec chemins complets
# Pour apprendre-autrement

$ProjectPath = "C:\Users\AAA\Documents\iahome\apprendre-autrement"
$DockerComposeFile = "$ProjectPath\docker-compose.yml"

Write-Host "🚀 Démarrage de apprendre-autrement..." -ForegroundColor Green
Write-Host "📁 Chemin du projet: $ProjectPath" -ForegroundColor Cyan

# Vérifier si Docker est installé
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Aller dans le dossier du projet
Set-Location $ProjectPath

# Vérifier que le fichier docker-compose.yml existe
if (-not (Test-Path $DockerComposeFile)) {
    Write-Host "❌ Fichier docker-compose.yml introuvable dans $ProjectPath" -ForegroundColor Red
    exit 1
}

# Construire et démarrer les conteneurs avec chemin complet
Write-Host "📦 Construction et démarrage des conteneurs..." -ForegroundColor Cyan
Write-Host "   Fichier utilisé: $DockerComposeFile" -ForegroundColor Gray

docker-compose -f $DockerComposeFile up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Application démarrée avec succès !" -ForegroundColor Green
    Write-Host "🌐 Accédez à l'application sur http://localhost:9001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Commandes utiles:" -ForegroundColor Yellow
    Write-Host "  Voir les logs: docker-compose -f $DockerComposeFile logs -f" -ForegroundColor White
    Write-Host "  Arrêter: docker-compose -f $DockerComposeFile down" -ForegroundColor White
    Write-Host "  Redémarrer: docker-compose -f $DockerComposeFile restart" -ForegroundColor White
} else {
    Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    exit 1
}





