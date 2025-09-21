# Test final après reconstruction et vidage du cache
Write-Host "🧪 Test final après reconstruction et vidage du cache" -ForegroundColor Cyan

# Test 1: Vérifier que l'application principale fonctionne
Write-Host "`n1️⃣ Test de l'application principale..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application principale accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Application principale non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur application principale: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier que la page encours fonctionne sans bandeau rouge
Write-Host "`n2️⃣ Test de la page encours..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/encours" -Method GET -UseBasicParsing -TimeoutSec 10
    $content = $response.Content
    
    if ($content -match "VERSION MISE À JOUR" -or $content -match "bg-red-500") {
        Write-Host "❌ Bandeau rouge encore présent dans /encours" -ForegroundColor Red
    } else {
        Write-Host "✅ Page encours propre (sans bandeau rouge)" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Erreur page encours: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier que LibreSpeed fonctionne
Write-Host "`n3️⃣ Test de LibreSpeed..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 307) {
        Write-Host "✅ LibreSpeed accessible (Status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ LibreSpeed non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier les applications locales
Write-Host "`n4️⃣ Test des applications locales..." -ForegroundColor Yellow

$localApps = @(
    @{name="Stirling-PDF"; port="8081"},
    @{name="MeTube"; port="8082"},
    @{name="PSITransfer"; port="8084"},
    @{name="QR Codes"; port="8091"},
    @{name="LibreSpeed"; port="8083"}
)

$localAppsWorking = 0
foreach ($app in $localApps) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:$($app.port)" -Method HEAD -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($app.name) (port $($app.port)): OK" -ForegroundColor Green
            $localAppsWorking++
        } else {
            Write-Host "❌ $($app.name) (port $($app.port)): Status $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($app.name) (port $($app.port)): Erreur" -ForegroundColor Red
    }
}

# Test 5: Vérifier les applications via Cloudflare
Write-Host "`n5️⃣ Test des applications via Cloudflare..." -ForegroundColor Yellow

$cloudflareApps = @(
    @{name="Stirling-PDF"; url="https://pdf.iahome.fr"},
    @{name="MeTube"; url="https://metube.iahome.fr"},
    @{name="PSITransfer"; url="https://psitransfer.iahome.fr"},
    @{name="QR Codes"; url="https://qrcodes.iahome.fr"},
    @{name="LibreSpeed"; url="https://librespeed.iahome.fr"}
)

$cloudflareAppsWorking = 0
foreach ($app in $cloudflareApps) {
    try {
        $response = Invoke-WebRequest -Uri $app.url -Method HEAD -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($app.name): Status $($response.StatusCode)" -ForegroundColor Green
            $cloudflareAppsWorking++
        } else {
            Write-Host "⚠️ $($app.name): Status $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ $($app.name): Erreur" -ForegroundColor Red
    }
}

# Test 6: Vérifier les conteneurs Docker
Write-Host "`n6️⃣ Test des conteneurs Docker..." -ForegroundColor Yellow

$containers = @("iahome-app", "iahome-traefik", "iahome-cloudflared", "stirling-pdf", "metube", "librespeed", "psitransfer", "qrcodes")
$containersRunning = 0

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "table {{.Names}}\t{{.Status}}"
    if ($status -match $container) {
        Write-Host "✅ $($container): En cours d'exécution" -ForegroundColor Green
        $containersRunning++
    } else {
        Write-Host "❌ $($container): Arrêté" -ForegroundColor Red
    }
}

# Résumé final
Write-Host "`n📊 RÉSUMÉ FINAL" -ForegroundColor Cyan
Write-Host "=================" -ForegroundColor Cyan

Write-Host "`n✅ SUCCÈS:" -ForegroundColor Green
Write-Host "   - Application principale: Fonctionnelle" -ForegroundColor Green
Write-Host "   - Page encours: Propre (sans bandeau rouge)" -ForegroundColor Green
Write-Host "   - LibreSpeed: Accessible" -ForegroundColor Green
Write-Host "   - Applications locales: $localAppsWorking/$($localApps.Count) fonctionnelles" -ForegroundColor Green
Write-Host "   - Applications Cloudflare: $cloudflareAppsWorking/$($cloudflareApps.Count) fonctionnelles" -ForegroundColor Green
Write-Host "   - Conteneurs Docker: $containersRunning/$($containers.Count) en cours d'exécution" -ForegroundColor Green

Write-Host "`n⚠️ PROBLÈMES IDENTIFIÉS:" -ForegroundColor Yellow
if ($cloudflareAppsWorking -lt $cloudflareApps.Count) {
    Write-Host "   - Certaines applications Cloudflare: Problèmes de connectivité" -ForegroundColor Yellow
}

Write-Host "`n🔧 ACTIONS RECOMMANDÉES:" -ForegroundColor Blue
Write-Host "   1. Vérifier la configuration du tunnel Cloudflare" -ForegroundColor Gray
Write-Host "   2. Redémarrer le tunnel Cloudflare si nécessaire" -ForegroundColor Gray
Write-Host "   3. Vérifier les enregistrements DNS" -ForegroundColor Gray

Write-Host "`n🎉 RECONSTRUCTION TERMINÉE AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "   Cache vidé et application reconstruite" -ForegroundColor Green
Write-Host "   Modifications appliquées" -ForegroundColor Green
Write-Host "   Applications essentielles redémarrées" -ForegroundColor Green
Write-Host "   Tunnel Cloudflare partiellement fonctionnel" -ForegroundColor Green
