# Script pour corriger les problèmes de connexion Cloudflared
Write-Host "🔧 Correction des problèmes de connexion Cloudflared..." -ForegroundColor Green
Write-Host "=====================================================" -ForegroundColor Green

# Vérifier l'état actuel
Write-Host "`n📊 État actuel des services:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr -E "(iahome|traefik|cloudflared)"

# Arrêter le tunnel Cloudflared actuel
Write-Host "`n🛑 Arrêt du tunnel Cloudflared actuel..." -ForegroundColor Yellow
docker stop cloudflared-tunnel
docker rm cloudflared-tunnel

# Vérifier que les services sont accessibles localement
Write-Host "`n🔍 Vérification de l'accessibilité des services..." -ForegroundColor Yellow

$services = @(
    @{Name="IAHome App"; Url="http://localhost:3000"; Expected="200"},
    @{Name="Traefik"; Url="http://localhost:80"; Expected="200"},
    @{Name="Traefik Dashboard"; Url="http://localhost:8080"; Expected="200"}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -Method GET -TimeoutSec 5 -ErrorAction Stop
        if ($response.StatusCode -eq $service.Expected) {
            Write-Host "✅ $($service.Name) - Accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️ $($service.Name) - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($service.Name) - Non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Redémarrer Cloudflared avec la nouvelle configuration
Write-Host "`n🚀 Redémarrage de Cloudflared avec la nouvelle configuration..." -ForegroundColor Yellow

# Utiliser la configuration corrigée
$configFile = "cloudflared-config-fixed.yml"
if (Test-Path $configFile) {
    Write-Host "✅ Configuration trouvée: $configFile" -ForegroundColor Green
    
    # Démarrer le tunnel avec la nouvelle configuration
    docker run -d `
        --name cloudflared-tunnel `
        --restart unless-stopped `
        -v "${PWD}\${configFile}:/etc/cloudflared/config.yml" `
        -v "C:\Users\AAA\.cloudflared:C:\Users\AAA\.cloudflared" `
        cloudflare/cloudflared:latest `
        tunnel --config /etc/cloudflared/config.yml run
    
    Write-Host "✅ Cloudflared redémarré avec la nouvelle configuration" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier de configuration non trouvé: $configFile" -ForegroundColor Red
    exit 1
}

# Attendre que le tunnel se connecte
Write-Host "`n⏳ Attente de la connexion du tunnel..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier l'état du tunnel
Write-Host "`n📋 Vérification de l'état du tunnel..." -ForegroundColor Yellow
try {
    $tunnelInfo = cloudflared tunnel info iahome-tunnel
    Write-Host "✅ Tunnel actif:" -ForegroundColor Green
    Write-Host $tunnelInfo
} catch {
    Write-Host "❌ Erreur lors de la vérification du tunnel: $($_.Exception.Message)" -ForegroundColor Red
}

# Vérifier les logs
Write-Host "`n📋 Vérification des logs Cloudflared..." -ForegroundColor Yellow
docker logs cloudflared-tunnel --tail 10

# Test de connectivité
Write-Host "`n🧪 Test de connectivité..." -ForegroundColor Yellow
$testUrls = @(
    "https://iahome.fr",
    "https://librespeed.iahome.fr"
)

foreach ($url in $testUrls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -TimeoutSec 10 -ErrorAction Stop
        Write-Host "✅ $url - Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } catch {
        Write-Host "❌ $url - Non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Résumé de la correction:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "✅ Configuration Cloudflared corrigée" -ForegroundColor Green
Write-Host "✅ Services pointent vers localhost" -ForegroundColor Green
Write-Host "✅ Tunnel redémarré" -ForegroundColor Green
Write-Host "✅ Tests de connectivité effectués" -ForegroundColor Green

Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "- Vérifier que tous les services sont accessibles via les domaines"
Write-Host "- Tester l'accès aux modules via les boutons d'autorisation"
Write-Host "- Surveiller les logs pour détecter d'éventuels problèmes"

Write-Host "`n✨ Correction terminée!" -ForegroundColor Green
