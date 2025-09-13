# Script d'arrêt pour le service Converter
# Usage: .\stop-converter.ps1

Write-Host "🛑 Arrêt du service Converter..." -ForegroundColor Yellow

# Se déplacer dans le dossier converter
Set-Location $PSScriptRoot

# Arrêter les services
Write-Host "📦 Arrêt des conteneurs..." -ForegroundColor Yellow
docker-compose down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Service Converter arrêté avec succès!" -ForegroundColor Green
    
    # Optionnel: Nettoyer les images non utilisées
    $cleanup = Read-Host "Voulez-vous nettoyer les images non utilisées? (y/N)"
    if ($cleanup -eq "y" -or $cleanup -eq "Y") {
        Write-Host "🧹 Nettoyage des images non utilisées..." -ForegroundColor Yellow
        docker image prune -f
    }
} else {
    Write-Host "❌ Erreur lors de l'arrêt du service Converter." -ForegroundColor Red
    exit 1
}
