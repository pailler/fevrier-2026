# Script de démarrage rapide pour IAHome avec design SAAS
# Compatible Windows PowerShell

Write-Host "🚀 Démarrage rapide IAHome avec design SAAS..." -ForegroundColor Green

# Vérifier que Docker est démarré
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier si le design SAAS est déjà appliqué
if (-not (Test-Path "src/components/HeroSection.tsx")) {
    Write-Host "🎨 Application du design SAAS..." -ForegroundColor Yellow
    .\update-design-saas.ps1
} else {
    Write-Host "✅ Design SAAS déjà appliqué" -ForegroundColor Green
}

# Arrêter les conteneurs existants
Write-Host "🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down 2>$null
docker-compose -f docker-services/docker-compose.services.yml down 2>$null

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images obsolètes..." -ForegroundColor Yellow
docker system prune -f

# Reconstruire l'image avec le nouveau design
Write-Host "🔨 Reconstruction de l'image avec le nouveau design..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml build --no-cache

# Démarrer les services
Write-Host "🚀 Démarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d
docker-compose -f docker-services/docker-compose.services.yml up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier la santé des services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Test de l'API de santé
Write-Host "🔍 Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API de santé accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ L'API de santé n'est pas accessible" -ForegroundColor Red
}

Write-Host "`n🎉 Démarrage terminé avec succès !" -ForegroundColor Green
Write-Host "🌐 Votre application SAAS est accessible sur: https://iahome.fr" -ForegroundColor Cyan
Write-Host "📊 Dashboard Traefik: http://localhost:8080" -ForegroundColor Cyan
Write-Host "`n✨ Nouveau design SAAS avec:" -ForegroundColor Cyan
Write-Host "   • Logo 'bubble' et navigation moderne" -ForegroundColor White
Write-Host "   • Section Hero avec titre principal" -ForegroundColor White
Write-Host "   • Barre de recherche centrée" -ForegroundColor White
Write-Host "   • Filtres et sidebar de catégories" -ForegroundColor White
Write-Host "   • Cartes de templates avec vidéos YouTube" -ForegroundColor White
Write-Host "   • Design responsive et animations" -ForegroundColor White
Write-Host "`n🔧 Services disponibles:" -ForegroundColor Cyan
Write-Host "   • PDF Service: https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   • MeTube Service: https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   • LibreSpeed Service: https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   • PsiTransfer Service: https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   • QR Code Service: https://qrcode.regispailler.fr" -ForegroundColor White
