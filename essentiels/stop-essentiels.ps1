# Script d'arrêt des services essentiels IAhome
# Auteur: IAhome
# Date: 2025-09-11

Write-Host "🛑 Arrêt des services essentiels IAhome..." -ForegroundColor Yellow

# Se déplacer dans le répertoire essentiels
Set-Location $PSScriptRoot

Write-Host "📦 Arrêt des containers essentiels..." -ForegroundColor Yellow

# Arrêter les services essentiels
docker-compose -f docker-compose.services.yml stop stirling-pdf metube librespeed psitransfer universal-converter

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services essentiels arrêtés avec succès !" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'arrêt des services essentiels" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Services essentiels arrêtés !" -ForegroundColor Green
