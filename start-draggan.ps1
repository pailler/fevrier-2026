# Script de démarrage pour le service DragGAN
# Compatible Windows PowerShell

Write-Host "🎨 Démarrage du service DragGAN..." -ForegroundColor Green

# Vérifier que Docker est démarré
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Créer les répertoires nécessaires
Write-Host "📁 Création des répertoires..." -ForegroundColor Yellow
$directories = @(
    "docker-services/draggan/models",
    "docker-services/draggan/outputs", 
    "docker-services/draggan/uploads",
    "docker-services/draggan/cache"
)

foreach ($dir in $directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Créé: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Existe déjà: $dir" -ForegroundColor Green
    }
}

# Arrêter le service s'il tourne déjà
Write-Host "🛑 Arrêt du service existant..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.draggan.yml down 2>$null

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images obsolètes..." -ForegroundColor Yellow
docker system prune -f

# Construire l'image DragGAN
Write-Host "🔨 Construction de l'image DragGAN..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.draggan.yml build --no-cache

# Démarrer le service
Write-Host "🚀 Démarrage du service DragGAN..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.draggan.yml up -d

# Attendre que le service soit prêt
Write-Host "⏳ Attente du démarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier la santé du service
Write-Host "🏥 Vérification de la santé du service..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.draggan.yml ps

# Test de connectivité
Write-Host "🔍 Test de connectivité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8087" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ Service DragGAN accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Service DragGAN non accessible" -ForegroundColor Red
}

# Vérifier les logs
Write-Host "📋 Logs récents:" -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.draggan.yml logs --tail=10

Write-Host "`n🎉 Service DragGAN démarré avec succès !" -ForegroundColor Green
Write-Host "🌐 Interface accessible sur: http://localhost:8087" -ForegroundColor Cyan
Write-Host "🔗 URL de production: https://draggan.regispailler.fr" -ForegroundColor Cyan
Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "   • Interface Gradio pour l'édition d'images" -ForegroundColor White
Write-Host "   • Modèles pré-entraînés inclus" -ForegroundColor White
Write-Host "   • Support GPU/CPU automatique" -ForegroundColor White
Write-Host "   • Sauvegarde automatique des résultats" -ForegroundColor White
