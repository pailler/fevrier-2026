# Script de redémarrage complet pour tous les services IAHome
# Compatible Windows PowerShell

Write-Host "🔄 Redémarrage complet de tous les services IAHome..." -ForegroundColor Green

# Vérifier que Docker est démarré
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Arrêter tous les services
Write-Host "🛑 Arrêt des services..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml down
docker-compose -f docker-compose.prod.yml down

# Attendre un peu
Write-Host "⏳ Pause de 5 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Nettoyer les conteneurs orphelins
Write-Host "🧹 Nettoyage des conteneurs orphelins..." -ForegroundColor Yellow
docker container prune -f

# Redémarrer les services externes
Write-Host "🔧 Redémarrage des services externes..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d

# Attendre que les services externes soient prêts
Write-Host "⏳ Attente du démarrage des services externes..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Redémarrer les services principaux
Write-Host "🚀 Redémarrage des services principaux..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# Attendre que tous les services soient prêts
Write-Host "⏳ Attente du démarrage complet..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier la santé de tous les services
Write-Host "🏥 Vérification de la santé des services..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml ps
docker-compose -f docker-compose.prod.yml ps

# Test de connectivité pour chaque service
Write-Host "🔍 Test de connectivité des services..." -ForegroundColor Yellow

$services = @(
    @{Name="IAHome App"; URL="http://localhost:3000"; Port=3000},
    @{Name="Stirling-PDF"; URL="http://localhost:8081"; Port=8081},
    @{Name="MeTube"; URL="http://localhost:8082"; Port=8082},
    @{Name="LibreSpeed"; URL="http://localhost:8083"; Port=8083},
    @{Name="PSITransfer"; URL="http://localhost:8084"; Port=8084},
    @{Name="Polr"; URL="http://localhost:8086"; Port=8086},
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ $($service.Name) accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) non accessible" -ForegroundColor Red
    }
}

# Vérifier les logs récents
Write-Host "📋 Logs récents des services externes:" -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml logs --tail=3

Write-Host "📋 Logs récents des services principaux:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=3

Write-Host "`n🎉 Redémarrage complet terminé !" -ForegroundColor Green
Write-Host "`n🌐 Services disponibles:" -ForegroundColor Cyan
Write-Host "   • IAHome App:       http://localhost:3000 | https://iahome.fr" -ForegroundColor White
Write-Host "   • Stirling-PDF:     http://localhost:8081 | https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   • MeTube:           http://localhost:8082 | https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   • LibreSpeed:       http://localhost:8083 | https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   • PSITransfer:      http://localhost:8084 | https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   • Polr (QR):        http://localhost:8086 | https://qrcode.regispailler.fr" -ForegroundColor White


Write-Host "`n🔧 Commandes utiles:" -ForegroundColor Yellow
Write-Host "   • Voir les logs:     docker-compose -f docker-services/docker-compose.services.yml logs -f" -ForegroundColor White
Write-Host "   • Arrêter:           .\\stop-all-services.ps1" -ForegroundColor White
Write-Host "   • Vérifier l'état:   .\\check-status.ps1" -ForegroundColor White
Write-Host "   • Redémarrer:        .\\restart-all-services.ps1" -ForegroundColor White
