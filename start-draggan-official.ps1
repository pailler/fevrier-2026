# Script de démarrage pour DragGAN AI (Version Officielle)
# Basé sur le tutoriel de NFTevening

Write-Host "🚀 Démarrage de DragGAN AI (Version Officielle)" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green

# Vérification de Docker
Write-Host "📋 Vérification de Docker..." -ForegroundColor Yellow
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Arrêt des conteneurs existants
Write-Host "🛑 Arrêt des conteneurs DragGAN existants..." -ForegroundColor Yellow
docker stop draggan 2>$null
docker rm draggan 2>$null

# Construction de l'image DragGAN
Write-Host "🔨 Construction de l'image DragGAN..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml build draggan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la construction de l'image DragGAN" -ForegroundColor Red
    exit 1
}

# Démarrage du service DragGAN
Write-Host "🚀 Démarrage du service DragGAN..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d draggan

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du démarrage du service DragGAN" -ForegroundColor Red
    exit 1
}

# Attente du démarrage
Write-Host "⏳ Attente du démarrage de DragGAN..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérification du statut
Write-Host "📊 Vérification du statut..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml ps draggan

# Affichage des URLs d'accès
Write-Host ""
Write-Host "✅ DragGAN AI est maintenant disponible !" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green
Write-Host "🌐 Accès local: http://localhost:8087" -ForegroundColor Cyan
Write-Host "🌐 Accès via Traefik: https://draggan.regispailler.fr" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Fonctionnalités disponibles:" -ForegroundColor Yellow
Write-Host "   • Édition d'images par glisser-déposer" -ForegroundColor White
Write-Host "   • Manipulation de points de contrôle" -ForegroundColor White
Write-Host "   • Transformation 3D d'images" -ForegroundColor White
Write-Host "   • Modèles pré-entraînés inclus" -ForegroundColor White
Write-Host ""
Write-Host "🔧 Pour arrêter: docker-compose -f docker-services/docker-compose.services.yml stop draggan" -ForegroundColor Gray
Write-Host "🔧 Pour voir les logs: docker-compose -f docker-services/docker-compose.services.yml logs -f draggan" -ForegroundColor Gray

