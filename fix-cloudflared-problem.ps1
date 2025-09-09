# Script pour diagnostiquer et corriger le problème Cloudflared
Write-Host "🔧 Diagnostic et correction Cloudflared" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# 1. Arrêter le conteneur Cloudflared problématique
Write-Host "`n🛑 Arrêt du conteneur Cloudflared problématique..." -ForegroundColor Yellow
docker stop cloudflared-tunnel 2>$null
docker rm cloudflared-tunnel 2>$null

# 2. Vérifier la configuration
Write-Host "`n📋 Vérification de la configuration..." -ForegroundColor Yellow
if (Test-Path "cloudflared-config-final.yml") {
    Write-Host "✅ Fichier de configuration trouvé" -ForegroundColor Green
    Write-Host "Contenu de la configuration:" -ForegroundColor Cyan
    Get-Content "cloudflared-config-final.yml" | Select-Object -First 15
} else {
    Write-Host "❌ Fichier de configuration manquant" -ForegroundColor Red
    exit 1
}

# 3. Tester l'accès local aux services
Write-Host "`n🧪 Test des services locaux..." -ForegroundColor Yellow

# Test IAHome
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ IAHome accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ IAHome non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test LibreSpeed
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8083" -Method GET -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ LibreSpeed accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ LibreSpeed non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Créer une configuration Cloudflared simplifiée
Write-Host "`n📝 Création d'une configuration Cloudflared simplifiée..." -ForegroundColor Yellow

$simpleConfig = @"
tunnel: b19084f4-e2d6-47f5-81c3-0972662e953c
credentials-file: C:\Users\AAA\.cloudflared\cert.pem

ingress:
  # Application principale IAHome
  - hostname: iahome.fr
    service: http://localhost:3000
  - hostname: www.iahome.fr
    service: http://localhost:3000
  
  # LibreSpeed - accès direct port 8083
  - hostname: librespeed.iahome.fr
    service: http://localhost:8083
  
  # Services via Traefik
  - hostname: pdf.iahome.fr
    service: http://localhost:8080
  - hostname: metube.iahome.fr
    service: http://localhost:8080
  - hostname: psitransfer.iahome.fr
    service: http://localhost:8080
  - hostname: qrcodes.iahome.fr
    service: http://localhost:8080
  
  # Catch-all rule
  - service: http_status:404
"@

$simpleConfig | Out-File -FilePath "cloudflared-config-simple.yml" -Encoding UTF8
Write-Host "✅ Configuration simplifiée créée" -ForegroundColor Green

# 5. Essayer de redémarrer Cloudflared avec le token
Write-Host "`n🚀 Redémarrage de Cloudflared..." -ForegroundColor Yellow
Write-Host "Token utilisé: eyJhIjoiYjE5MDg0ZjQtZTJkNi00N2Y1LTgxYzMtMDk3MjY2MmU5NTNjIiwiZCI6ImFhYS1kZXZlbG9wZXIifQ==" -ForegroundColor Cyan

try {
    docker run -d --name cloudflared-tunnel --restart unless-stopped -v "${PWD}\cloudflared-config-simple.yml:/etc/cloudflared/config.yml" cloudflare/cloudflared:latest tunnel --config /etc/cloudflared/config.yml run --token eyJhIjoiYjE5MDg0ZjQtZTJkNi00N2Y1LTgxYzMtMDk3MjY2MmU5NTNjIiwiZCI6ImFhYS1kZXZlbG9wZXIifQ==
    Write-Host "✅ Conteneur Cloudflared démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
}

# 6. Attendre et vérifier les logs
Write-Host "`n⏳ Attente de la connexion Cloudflared..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n📊 Logs Cloudflared:" -ForegroundColor Cyan
docker logs cloudflared-tunnel --tail 5

# 7. Test de connectivité
Write-Host "`n🧪 Test de connectivité..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ IAHome accessible via Cloudflared (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ IAHome non accessible via Cloudflared: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ LibreSpeed accessible via Cloudflared (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "❌ LibreSpeed non accessible via Cloudflared: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Résumé du diagnostic:" -ForegroundColor Green
Write-Host "=======================" -ForegroundColor Green
Write-Host "1. Conteneur Cloudflared redémarré" -ForegroundColor White
Write-Host "2. Configuration simplifiée appliquée" -ForegroundColor White
Write-Host "3. LibreSpeed pointe directement vers localhost:8083" -ForegroundColor White
Write-Host "4. Services locaux testés" -ForegroundColor White

Write-Host "`n📝 Si le problème persiste:" -ForegroundColor Yellow
Write-Host "- Vérifiez le token Cloudflared dans le dashboard Cloudflare" -ForegroundColor White
Write-Host "- Regénérez un nouveau token si nécessaire" -ForegroundColor White
Write-Host "- Vérifiez que le tunnel existe dans Cloudflare" -ForegroundColor White

Write-Host "`n✨ Diagnostic terminé!" -ForegroundColor Green
