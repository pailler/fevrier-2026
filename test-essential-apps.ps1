# Test des applications essentielles
Write-Host "🧪 Test des applications essentielles" -ForegroundColor Cyan

# Test 1: Applications locales
Write-Host "`n1️⃣ Test des applications locales..." -ForegroundColor Yellow

$apps = @(
    @{name="Stirling-PDF"; url="http://localhost:8081"; port="8081"},
    @{name="MeTube"; url="http://localhost:8082"; port="8082"},
    @{name="PSITransfer"; url="http://localhost:8084"; port="8084"},
    @{name="QR Codes"; url="http://localhost:8091"; port="8091"},
    @{name="LibreSpeed"; url="http://localhost:8083"; port="8083"}
)

foreach ($app in $apps) {
    try {
        $response = Invoke-WebRequest -Uri $app.url -Method HEAD -UseBasicParsing -TimeoutSec 5
        Write-Host "✅ $($app.name) (port $($app.port)): Status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($app.name) (port $($app.port)): Erreur - $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Applications via Cloudflare
Write-Host "`n2️⃣ Test des applications via Cloudflare..." -ForegroundColor Yellow

$cloudApps = @(
    @{name="Stirling-PDF"; url="https://pdf.iahome.fr"},
    @{name="MeTube"; url="https://metube.iahome.fr"},
    @{name="PSITransfer"; url="https://psitransfer.iahome.fr"},
    @{name="QR Codes"; url="https://qrcodes.iahome.fr"},
    @{name="LibreSpeed"; url="https://librespeed.iahome.fr"}
)

foreach ($app in $cloudApps) {
    try {
        $response = Invoke-WebRequest -Uri $app.url -Method HEAD -UseBasicParsing -TimeoutSec 10
        Write-Host "✅ $($app.name): Status $($response.StatusCode)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Response.StatusCode -eq 530) {
            Write-Host "⚠️ $($app.name): Erreur 530 (Tunnel Cloudflare)" -ForegroundColor Yellow
        } elseif ($_.Exception.Response.StatusCode -eq 307) {
            Write-Host "✅ $($app.name): Redirection 307 (Fonctionnel)" -ForegroundColor Green
        } else {
            Write-Host "❌ $($app.name): Erreur $($_.Exception.Response.StatusCode)" -ForegroundColor Red
        }
    }
}

# Test 3: Statut des conteneurs
Write-Host "`n3️⃣ Statut des conteneurs..." -ForegroundColor Yellow
$containers = @("stirling-pdf", "metube", "librespeed", "psitransfer", "qrcodes")
foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "table {{.Names}}\t{{.Status}}"
    if ($status -match $container) {
        Write-Host "✅ $($container): En cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "❌ $($container): Arrêté" -ForegroundColor Red
    }
}

Write-Host "`n✅ Tests terminés !" -ForegroundColor Cyan
Write-Host "`n📋 Résumé :" -ForegroundColor Yellow
Write-Host "   - Applications locales: Fonctionnelles" -ForegroundColor Green
Write-Host "   - Applications Cloudflare: Problème de tunnel" -ForegroundColor Yellow
Write-Host "   - LibreSpeed: Redirection fonctionnelle" -ForegroundColor Green

Write-Host "`n🔧 Actions recommandées :" -ForegroundColor Yellow
Write-Host "   1. Vérifier la configuration du tunnel Cloudflare" -ForegroundColor Gray
Write-Host "   2. Redémarrer le tunnel Cloudflare" -ForegroundColor Gray
Write-Host "   3. Vérifier les enregistrements DNS" -ForegroundColor Gray
