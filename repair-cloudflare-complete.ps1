# Script complet de réparation Cloudflare avec purge de cache
# Répare le tunnel ET vide le cache Cloudflare

Write-Host "🔧 Réparation complète de Cloudflare..." -ForegroundColor Cyan
Write-Host ""

# 1. Arrêter le tunnel
Write-Host "1️⃣ Arrêt du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
        Write-Host "   Arrêt PID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
} catch {
    Write-Host "   ✅ Aucun processus à arrêter" -ForegroundColor Green
}

# 2. Essayer de purger le cache
Write-Host "`n2️⃣ Tentative de purge du cache Cloudflare..." -ForegroundColor Yellow
$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN

if ($CloudflareApiToken) {
    Write-Host "   🔑 Token API détecté, purge via API..." -ForegroundColor Gray
    & .\purge-cloudflare-cache-manual.ps1
} else {
    Write-Host "   ⚠️ Token API non défini" -ForegroundColor Yellow
    Write-Host "   💡 Purge manuelle requise via Dashboard Cloudflare" -ForegroundColor Gray
    Write-Host "   💡 URL: https://dash.cloudflare.com/ > Zone iahome.fr > Mise en cache > Purger tout" -ForegroundColor Cyan
}

# 3. Redémarrer le tunnel
Write-Host "`n3️⃣ Redémarrage du tunnel Cloudflare..." -ForegroundColor Yellow

if (-not (Test-Path ".\cloudflared.exe")) {
    Write-Host "   ❌ cloudflared.exe non trouvé!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "cloudflare-active-config.yml")) {
    Write-Host "   ❌ Configuration non trouvée!" -ForegroundColor Red
    exit 1
}

try {
    $configPath = Resolve-Path "cloudflare-active-config.yml"
    $cloudflaredPath = Resolve-Path "cloudflared.exe"
    
    Write-Host "   🚀 Démarrage..." -ForegroundColor Gray
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    
    Write-Host "   ⏳ Attente de la connexion (15 secondes)..." -ForegroundColor Gray
    Start-Sleep -Seconds 15
    
    # Vérifier le statut
    $tunnelInfo = & .\cloudflared.exe tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID") {
        Write-Host "   ✅ Tunnel actif!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Tunnel démarré, connexion en cours..." -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vérification finale
Write-Host "`n4️⃣ Vérification finale..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

$testServices = @(
    @{Name="iahome.fr"; Url="https://iahome.fr"},
    @{Name="qrcodes"; Url="https://qrcodes.iahome.fr"},
    @{Name="librespeed"; Url="https://librespeed.iahome.fr"}
)

foreach ($service in $testServices) {
    try {
        $response = Invoke-WebRequest -Uri $service.Url -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        $cacheStatus = $response.Headers['CF-Cache-Status']
        Write-Host "   ✅ $($service.Name) : $($response.StatusCode)" -ForegroundColor Green
        if ($cacheStatus) {
            Write-Host "      Cache: $cacheStatus" -ForegroundColor Gray
        }
    } catch {
        $statusCode = "N/A"
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        Write-Host "   ⚠️ $($service.Name) : $statusCode" -ForegroundColor Yellow
    }
}

# 5. Instructions pour vider le cache navigateur
Write-Host "`n5️⃣ Cache navigateur:" -ForegroundColor Yellow
Write-Host "   💡 Pour vider le cache de votre navigateur:" -ForegroundColor Gray
Write-Host "      - Visitez: https://iahome.fr/clear-cache.html" -ForegroundColor Cyan
Write-Host "      - Ou appuyez sur: Ctrl+Shift+Delete (Chrome/Edge)" -ForegroundColor Cyan
Write-Host "      - Ou appuyez sur: Ctrl+F5 pour forcer le rechargement" -ForegroundColor Cyan

Write-Host "`n✅ Réparation complète terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Tunnel Cloudflare redémarré" -ForegroundColor Green
if ($CloudflareApiToken) {
    Write-Host "   ✅ Cache Cloudflare vidé via API" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Purge cache Cloudflare requise manuellement" -ForegroundColor Yellow
}
Write-Host "   💡 Vidage cache navigateur: https://iahome.fr/clear-cache.html" -ForegroundColor Cyan

