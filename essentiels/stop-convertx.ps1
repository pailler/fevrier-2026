# Script PowerShell pour arrêter ConvertX et Gotenberg
Write-Host "🛑 Arrêt de ConvertX et Gotenberg..." -ForegroundColor Yellow

# Aller dans le répertoire essentiels
Set-Location $PSScriptRoot

# Arrêter les services
Write-Host "📦 Arrêt des conteneurs..." -ForegroundColor Yellow
docker-compose -f docker-compose.convertx.yml down

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ConvertX et Gotenberg arrêtés avec succès !" -ForegroundColor Green
} else {
    Write-Host "❌ Erreur lors de l'arrêt des services" -ForegroundColor Red
    exit 1
}
