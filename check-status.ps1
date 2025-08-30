# Script de vérification d'état pour IAHome
# Compatible Windows PowerShell

Write-Host "🔍 Vérification de l'état des services IAHome..." -ForegroundColor Cyan

# Vérifier les conteneurs principaux
Write-Host "`n📦 Conteneurs principaux:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# Vérifier les conteneurs de services
Write-Host "`n🔧 Conteneurs de services:" -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml ps

# Vérifier l'utilisation des ressources
Write-Host "`n💾 Utilisation des ressources:" -ForegroundColor Yellow
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# Test de connectivité des services
Write-Host "`n🌐 Test de connectivité:" -ForegroundColor Yellow

$services = @(
    @{Name="IAHome Principal"; URL="http://localhost:3000/api/health"},
    @{Name="PDF Service"; URL="http://localhost:8081"},
    @{Name="MeTube Service"; URL="http://localhost:8082"},
    @{Name="LibreSpeed Service"; URL="http://localhost:8083"},
    @{Name="PsiTransfer Service"; URL="http://localhost:8084"},
    @{Name="Traefik Dashboard"; URL="http://localhost:8080"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ $($service.Name): Accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name): Non accessible" -ForegroundColor Red
    }
}

# Vérifier les logs récents
Write-Host "`n📋 Logs récents (IAHome):" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=5

Write-Host "`n✅ Vérification terminée !" -ForegroundColor Green
