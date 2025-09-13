# Script d'urgence pour purger le cache Cloudflare
# Ce script va forcer la purge complète du cache

Write-Host "🚨 PURGE D'URGENCE DU CACHE CLOUDFLARE" -ForegroundColor Red
Write-Host "=======================================" -ForegroundColor Red

# URLs à purger spécifiquement
$urlsToPurge = @(
    "https://iahome.fr/_next/static/chunks/main-app-e38d2e8ab4a0cc9e.js",
    "https://iahome.fr/_next/static/chunks/app/layout-8de0463f9b514e31.js",
    "https://iahome.fr/_next/static/chunks/app/essentiels/page-a9820ffa2ce7d1eb.js",
    "https://iahome.fr/_next/static/chunks/*",
    "https://iahome.fr/_next/static/css/*",
    "https://iahome.fr/_next/static/js/*"
)

Write-Host "🔄 Purge des URLs spécifiques..." -ForegroundColor Yellow

foreach ($url in $urlsToPurge) {
    Write-Host "📤 Purge: $url" -ForegroundColor Cyan
    
    # Utiliser curl pour forcer le rechargement
    try {
        $response = Invoke-WebRequest -Uri $url -Method GET -Headers @{
            "Cache-Control" = "no-cache, no-store, must-revalidate"
            "Pragma" = "no-cache"
            "Expires" = "0"
        } -ErrorAction SilentlyContinue
        
        Write-Host "✅ $url - Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "⚠️  $url - Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "🔧 INSTRUCTIONS MANUELLES CLOUDFLARE:" -ForegroundColor Red
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Sélectionnez votre domaine iahome.fr" -ForegroundColor White
Write-Host "3. Allez dans Caching > Configuration" -ForegroundColor White
Write-Host "4. Cliquez sur 'Purge Everything'" -ForegroundColor White
Write-Host "5. Confirmez la purge" -ForegroundColor White
Write-Host ""
Write-Host "📋 RÈGLES DE CACHE À CONFIGURER:" -ForegroundColor Red
Write-Host "1. Allez dans Rules > Page Rules" -ForegroundColor White
Write-Host "2. Créez une règle pour: iahome.fr/_next/static/*" -ForegroundColor White
Write-Host "3. Définissez: Cache Level = Bypass" -ForegroundColor White
Write-Host "4. Définissez: Edge Cache TTL = 0 seconds" -ForegroundColor White
Write-Host ""
Write-Host "✅ Script terminé - Suivez les instructions manuelles ci-dessus" -ForegroundColor Green
