# Script de démarrage des services essentiels IAhome
# Auteur: IAhome
# Date: 2025-09-11

Write-Host "🚀 Démarrage des services essentiels IAhome..." -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
if (-not (Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Desktop n'est pas en cours d'exécution. Veuillez le démarrer d'abord." -ForegroundColor Red
    exit 1
}

# Se déplacer dans le répertoire docker-services
Set-Location $PSScriptRoot

Write-Host "📦 Démarrage des containers essentiels..." -ForegroundColor Yellow

# Démarrer les services essentiels
docker-compose -f docker-compose.services.yml up -d stirling-pdf metube librespeed psitransfer universal-converter

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Services essentiels démarrés avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Services disponibles :" -ForegroundColor Cyan
    Write-Host "  • Stirling-PDF (PDF tools): http://localhost:8081" -ForegroundColor White
    Write-Host "  • MeTube (téléchargement): http://localhost:8082" -ForegroundColor White
    Write-Host "  • LibreSpeed (test vitesse): http://localhost:8083" -ForegroundColor White
    Write-Host "  • PsiTransfer (transfert): http://localhost:8084" -ForegroundColor White
    Write-Host "  • Universal Converter: http://localhost:8096" -ForegroundColor White
    Write-Host "  • QR Code Service: http://localhost:7005" -ForegroundColor White
    Write-Host ""
    Write-Host "🔗 URLs avec Traefik (si configuré) :" -ForegroundColor Cyan
    Write-Host "  • https://pdf.iahome.fr" -ForegroundColor White
    Write-Host "  • https://metube.iahome.fr" -ForegroundColor White
    Write-Host "  • https://librespeed.iahome.fr" -ForegroundColor White
    Write-Host "  • https://psitransfer.iahome.fr" -ForegroundColor White
    Write-Host "  • https://converter.iahome.fr" -ForegroundColor White
    Write-Host "  • https://qrcodes.iahome.fr" -ForegroundColor White
} else {
    Write-Host "❌ Erreur lors du démarrage des services essentiels" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Services essentiels prêts !" -ForegroundColor Green
