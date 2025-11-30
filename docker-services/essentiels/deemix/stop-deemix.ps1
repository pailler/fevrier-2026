# Script pour arrêter le conteneur Deemix
# Usage: .\stop-deemix.ps1

Write-Host "🛑 Arrêt de Deemix..." -ForegroundColor Cyan

# Vérifier que le conteneur existe
$containerExists = docker ps -a --filter name=deemix-iahome --format "{{.Names}}" | Select-String -Pattern "^deemix-iahome$"
if (-not $containerExists) {
    Write-Host "❌ Le conteneur Deemix n'existe pas" -ForegroundColor Yellow
    exit 0
}

# Arrêter le conteneur
Write-Host "`n📋 Arrêt du conteneur..." -ForegroundColor Yellow
docker stop deemix-iahome

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Conteneur arrêté avec succès" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'arrêt du conteneur" -ForegroundColor Red
    exit 1
}









