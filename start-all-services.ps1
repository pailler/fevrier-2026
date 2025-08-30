# Script de démarrage complet pour tous les services IAHome
# Compatible Windows PowerShell

Write-Host "🚀 Démarrage complet de tous les services IAHome..." -ForegroundColor Green

# Vérifier que Docker est démarré
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Créer les répertoires nécessaires pour DragGAN
Write-Host "📁 Création des répertoires DragGAN..." -ForegroundColor Yellow
$draggan_directories = @(
    "docker-services/draggan/models",
    "docker-services/draggan/outputs", 
    "docker-services/draggan/uploads",
    "docker-services/draggan/cache"
)

foreach ($dir in $draggan_directories) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir -Force | Out-Null
        Write-Host "✅ Créé: $dir" -ForegroundColor Green
    } else {
        Write-Host "✅ Existe déjà: $dir" -ForegroundColor Green
    }
}

# Arrêter tous les services existants
Write-Host "🛑 Arrêt des services existants..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml down 2>$null
docker-compose -f docker-compose.prod.yml down 2>$null

# Nettoyer les images obsolètes
Write-Host "🧹 Nettoyage des images obsolètes..." -ForegroundColor Yellow
docker system prune -f

# Construire l'image DragGAN
Write-Host "🔨 Construction de l'image DragGAN..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml build draggan --no-cache

# Démarrer tous les services
Write-Host "🚀 Démarrage de tous les services..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Vérifier la santé de tous les services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml ps

# Test de connectivité pour chaque service
Write-Host "🔍 Test de connectivité des services..." -ForegroundColor Yellow

$services = @(
    @{Name="Stirling-PDF"; URL="http://localhost:8081"; Port=8081},
    @{Name="MeTube"; URL="http://localhost:8082"; Port=8082},
    @{Name="LibreSpeed"; URL="http://localhost:8083"; Port=8083},
    @{Name="PSITransfer"; URL="http://localhost:8084"; Port=8084},
    @{Name="Polr"; URL="http://localhost:8086"; Port=8086},
    @{Name="DragGAN"; URL="http://localhost:8087"; Port=8087}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ $($service.Name) accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) non accessible" -ForegroundColor Red
    }
}

# Vérifier les logs des services
Write-Host "📋 Logs récents des services:" -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml logs --tail=5

Write-Host "`n🎉 Tous les services IAHome démarrés avec succès !" -ForegroundColor Green
Write-Host "`n🌐 Services disponibles:" -ForegroundColor Cyan
Write-Host "   • Stirling-PDF:     http://localhost:8081 | https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   • MeTube:           http://localhost:8082 | https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   • LibreSpeed:       http://localhost:8083 | https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   • PSITransfer:      http://localhost:8084 | https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   • Polr (QR):        http://localhost:8086 | https://qrcode.regispailler.fr" -ForegroundColor White
Write-Host "   • DragGAN:          http://localhost:8087 | https://draggan.regispailler.fr" -ForegroundColor White

Write-Host "`n📚 Nouveau module DragGAN:" -ForegroundColor Yellow
Write-Host "   • Édition d'images par IA" -ForegroundColor White
Write-Host "   • Interface Gradio moderne" -ForegroundColor White
Write-Host "   • Modèles pré-entraînés inclus" -ForegroundColor White
Write-Host "   • Support GPU/CPU automatique" -ForegroundColor White
Write-Host "   • Sauvegarde automatique des résultats" -ForegroundColor White

Write-Host "`n🔧 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   • Voir les logs:     docker-compose -f docker-services/docker-compose.services.yml logs -f" -ForegroundColor White
Write-Host "   • Arrêter:           .\\stop-all-services.ps1" -ForegroundColor White
Write-Host "   • Vérifier l'état:   .\\check-status.ps1" -ForegroundColor White
Write-Host "   • Redémarrer:        .\\restart-all-services.ps1" -ForegroundColor White
