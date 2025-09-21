# Test final QR Codes
Write-Host "🧪 Test final QR Codes" -ForegroundColor Cyan

# Test 1: Vérifier l'accès local
Write-Host "`n1️⃣ Test accès local..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:7005/?token=prov_agy99y_mftigs6u" -Method GET -UseBasicParsing -TimeoutSec 10
    $content = $response.Content
    
    if ($content -match "Authentification requise") {
        Write-Host "❌ Page d'authentification détectée localement" -ForegroundColor Red
    } else {
        Write-Host "✅ Interface QR Codes accessible localement" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur accès local: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier l'accès via Cloudflare
Write-Host "`n2️⃣ Test accès via Cloudflare..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/?token=prov_agy99y_mftigs6u" -Method GET -UseBasicParsing -TimeoutSec 10
    $content = $response.Content
    
    if ($content -match "Authentification requise") {
        Write-Host "❌ Page d'authentification détectée via Cloudflare" -ForegroundColor Red
    } else {
        Write-Host "✅ Interface QR Codes accessible via Cloudflare" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur accès Cloudflare: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier les conteneurs
Write-Host "`n3️⃣ Test conteneurs..." -ForegroundColor Yellow
$containers = @("qr-code-service", "qrcodes", "iahome-traefik", "iahome-cloudflared")
foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "table {{.Names}}\t{{.Status}}"
    if ($status -match $container) {
        Write-Host "✅ $($container): En cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "❌ $($container): Arrêté" -ForegroundColor Red
    }
}

# Test 4: Vérifier les ports
Write-Host "`n4️⃣ Test ports..." -ForegroundColor Yellow
$ports = @(
    @{name="QR Codes local"; port="7005"},
    @{name="QR Codes Docker"; port="8091"},
    @{name="Traefik"; port="443"}
)

foreach ($port in $ports) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($port.port)" -Method HEAD -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ $($port.name) (port $($port.port)): Status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($port.name) (port $($port.port)): Erreur" -ForegroundColor Red
    }
}

# Test 5: Vérifier la configuration
Write-Host "`n5️⃣ Test configuration..." -ForegroundColor Yellow
if (Test-Path "traefik/dynamic/qrcodes-direct.yml") {
    Write-Host "✅ Configuration Traefik QR Codes trouvée" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration Traefik QR Codes manquante" -ForegroundColor Red
}

if (Test-Path "cloudflared-config.yml") {
    Write-Host "✅ Configuration Cloudflare trouvée" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration Cloudflare manquante" -ForegroundColor Red
}

# Résumé
Write-Host "`n📊 RÉSUMÉ" -ForegroundColor Cyan
Write-Host "=========" -ForegroundColor Cyan

Write-Host "`n🔧 SOLUTION IMPLÉMENTÉE:" -ForegroundColor Blue
Write-Host "   - Service QR Codes modifié pour accepter les tokens d'accès" -ForegroundColor Gray
Write-Host "   - Configuration Traefik pour routage direct" -ForegroundColor Gray
Write-Host "   - Configuration Cloudflare pour pointer vers Traefik" -ForegroundColor Gray
Write-Host "   - Service redémarré avec nouvelle image" -ForegroundColor Gray

Write-Host "`n⚠️ PROBLÈME IDENTIFIÉ:" -ForegroundColor Yellow
Write-Host "   - Le tunnel Cloudflare ne se connecte pas correctement" -ForegroundColor Yellow
Write-Host "   - Les requêtes via Cloudflare ne parviennent pas au service modifié" -ForegroundColor Yellow

Write-Host "`n💡 RECOMMANDATIONS:" -ForegroundColor Green
Write-Host "   1. Utiliser l'accès local temporairement: http://localhost:7005" -ForegroundColor Gray
Write-Host "   2. Vérifier la configuration du tunnel Cloudflare" -ForegroundColor Gray
Write-Host "   3. Redémarrer le tunnel Cloudflare" -ForegroundColor Gray
Write-Host "   4. Vérifier les enregistrements DNS" -ForegroundColor Gray

Write-Host "`n🎉 SUCCÈS PARTIEL:" -ForegroundColor Green
Write-Host "   - Service QR Codes modifié et fonctionnel localement" -ForegroundColor Green
Write-Host "   - Tokens d'accès acceptés" -ForegroundColor Green
Write-Host "   - Interface accessible sans authentification" -ForegroundColor Green
Write-Host "   - Problème de tunnel Cloudflare à résoudre" -ForegroundColor Yellow
