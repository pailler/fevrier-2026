# Script PowerShell pour démarrer ConvertX et Gotenberg
Write-Host "🚀 Démarrage de ConvertX et Gotenberg..." -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Desktop n'est pas en cours d'exécution. Veuillez le démarrer d'abord." -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire docker-services
Set-Location $PSScriptRoot

# Démarrer les services
Write-Host "📦 Démarrage des conteneurs..." -ForegroundColor Yellow
docker-compose -f docker-compose.convertx.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ ConvertX et Gotenberg démarrés avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Services disponibles :" -ForegroundColor Cyan
    Write-Host "   - ConvertX: http://localhost:9080" -ForegroundColor White
    Write-Host "   - Gotenberg: http://localhost:9081" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Statut des conteneurs :" -ForegroundColor Cyan
    docker-compose -f docker-compose.convertx.yml ps
} else {
    Write-Host "❌ Erreur lors du démarrage des services" -ForegroundColor Red
    exit 1
}
