# Script pour forcer la purge complète du cache Cloudflare

Write-Host "🚨 PURGE FORCÉE DU CACHE CLOUDFLARE" -ForegroundColor Red
Write-Host "====================================" -ForegroundColor Red

# URLs à purger avec des paramètres de cache-busting
$timestamp = [DateTimeOffset]::UtcNow.ToUnixTimeSeconds()
$urlsToPurge = @(
    "https://iahome.fr/?v=$timestamp",
    "https://iahome.fr/_next/static/chunks/main-app-e38d2e8ab4a0cc9e.js?v=$timestamp",
    "https://iahome.fr/_next/static/chunks/app/layout-8de0463f9b514e31.js?v=$timestamp",
    "https://iahome.fr/_next/static/chunks/app/essentiels/page-a9820ffa2ce7d1eb.js?v=$timestamp"
)

Write-Host "🔄 Purge avec cache-busting..." -ForegroundColor Yellow

foreach ($url in $urlsToPurge) {
    Write-Host "📤 Purge: $url" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers @{
            "Cache-Control" = "no-cache, no-store, must-revalidate"
            "Pragma" = "no-cache"
            "Expires" = "0"
            "If-None-Match" = "*"
        } -ErrorAction SilentlyContinue
        
        Write-Host "✅ $url - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $url - Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔧 ACTIONS MANUELLES REQUISES:" -ForegroundColor Red
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Sélectionnez iahome.fr" -ForegroundColor White
Write-Host "3. Caching > Configuration > Purge Everything" -ForegroundColor White
Write-Host "4. Rules > Page Rules > Créer une règle:" -ForegroundColor White
Write-Host "   - URL: iahome.fr/_next/static/*" -ForegroundColor Gray
Write-Host "   - Cache Level: Bypass" -ForegroundColor Gray
Write-Host "   - Edge Cache TTL: 0 seconds" -ForegroundColor Gray
Write-Host ""
Write-Host "🌐 Test après purge:" -ForegroundColor Blue
Write-Host "https://iahome.fr" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Script terminé" -ForegroundColor Green


