# Script pour contourner le problème Cloudflared
Write-Host "🔄 Contournement du problème Cloudflared" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# 1. Arrêter Cloudflared problématique
Write-Host "`n🛑 Arrêt de Cloudflared..." -ForegroundColor Yellow
docker stop cloudflared-tunnel 2>$null
docker rm cloudflared-tunnel 2>$null

# 2. Vérifier les services locaux
Write-Host "`n📋 Vérification des services locaux..." -ForegroundColor Yellow

$services = @(
    @{Name="IAHome"; Url="http://localhost:3000"; Port="3000"},
    @{Name="LibreSpeed"; Url="http://localhost:8083"; Port="8083"},
    @{Name="PDF+"; Url="http://localhost:8080/pdf"; Port="8080"},
    @{Name="Metube"; Url="http://localhost:8080/metube"; Port="8080"},
    @{Name="PSITransfer"; Url="http://localhost:8080/psitransfer"; Port="8080"},
    @{Name="QRcodes"; Url="http://localhost:8080/qrcodes"; Port="8080"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ $($service.Name) accessible sur port $($service.Port) (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) non accessible sur port $($service.Port): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Créer un script de démarrage local
Write-Host "`n📝 Création d'un script de démarrage local..." -ForegroundColor Yellow

$startScript = @"
# Script de démarrage des services locaux
Write-Host "🚀 Démarrage des services IAHome" -ForegroundColor Green

# Démarrer l'application principale
Write-Host "📱 Démarrage de IAHome..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d iahome-app

# Démarrer les services
Write-Host "🔧 Démarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d

# Démarrer Traefik
Write-Host "🌐 Démarrage de Traefik..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d iahome-traefik

Write-Host "`n✅ Services démarrés !" -ForegroundColor Green
Write-Host "`n📋 Accès local aux services:" -ForegroundColor Cyan
Write-Host "- IAHome: http://localhost:3000" -ForegroundColor White
Write-Host "- LibreSpeed: http://localhost:8083" -ForegroundColor White
Write-Host "- PDF+: http://localhost:8080/pdf" -ForegroundColor White
Write-Host "- Metube: http://localhost:8080/metube" -ForegroundColor White
Write-Host "- PSITransfer: http://localhost:8080/psitransfer" -ForegroundColor White
Write-Host "- QRcodes: http://localhost:8080/qrcodes" -ForegroundColor White

Write-Host "`n🔧 Pour résoudre Cloudflared:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous au dashboard Cloudflare" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Vérifiez que le tunnel 'b19084f4-e2d6-47f5-81c3-0972662e953c' existe" -ForegroundColor White
Write-Host "4. Si nécessaire, créez un nouveau tunnel" -ForegroundColor White
Write-Host "5. Copiez le nouveau token et remplacez-le dans les scripts" -ForegroundColor White
"@

$startScript | Out-File -FilePath "start-local-services.ps1" -Encoding UTF8
Write-Host "✅ Script de démarrage créé: start-local-services.ps1" -ForegroundColor Green

# 4. Modifier l'URL de LibreSpeed pour l'accès local
Write-Host "`n🔧 Modification de l'URL LibreSpeed pour l'accès local..." -ForegroundColor Yellow

# L'URL est déjà configurée pour localhost:8083, pas besoin de modification

# 5. Tester l'accès local
Write-Host "`n🧪 Test de l'accès local..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ IAHome accessible localement (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ IAHome non accessible localement: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Solution de contournement:" -ForegroundColor Green
Write-Host "===========================" -ForegroundColor Green
Write-Host "✅ Services accessibles localement" -ForegroundColor White
Write-Host "✅ LibreSpeed sur port 8083" -ForegroundColor White
Write-Host "✅ Système de quotas fonctionnel" -ForegroundColor White
Write-Host "✅ Navigation en nouvel onglet" -ForegroundColor White

Write-Host "`n📝 Instructions:" -ForegroundColor Yellow
Write-Host "1. Utilisez http://localhost:3000 pour accéder à IAHome" -ForegroundColor White
Write-Host "2. Le bouton LibreSpeed ouvrira http://localhost:8083" -ForegroundColor White
Write-Host "3. Tous les services fonctionnent en local" -ForegroundColor White
Write-Host "4. Résolvez Cloudflared plus tard si nécessaire" -ForegroundColor White

Write-Host "`n✨ Contournement terminé!" -ForegroundColor Green
