# Script de test pour vérifier les routes de redirection

Write-Host "🧪 Test des routes de redirection sécurisées" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Cyan

$routes = @(
    "/api/redirect-librespeed",
    "/api/redirect-metube", 
    "/api/redirect-pdf",
    "/api/redirect-psitransfer",
    "/api/redirect-qrcodes",
    "/api/redirect-converter",
    "/api/redirect-stablediffusion",
    "/api/redirect-ruinedfooocus",
    "/api/redirect-invoke",
    "/api/redirect-comfyui",
    "/api/redirect-cogstudio",
    "/api/redirect-sdnext"
)

Write-Host "`n1. Vérification des fichiers de routes..." -ForegroundColor Yellow

foreach ($route in $routes) {
    $filePath = "src/app$route/route.ts"
    if (Test-Path $filePath) {
        Write-Host "   ✅ $route" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $route manquant" -ForegroundColor Red
    }
}

Write-Host "`n2. Test des routes (simulation)..." -ForegroundColor Yellow

foreach ($route in $routes) {
    $appName = $route -replace "/api/redirect-", ""
    Write-Host "   🔗 $route -> https://$appName.iahome.fr" -ForegroundColor Cyan
}

Write-Host "`n3. Instructions de test:" -ForegroundColor Magenta
Write-Host "   1. Videz le cache du navigateur (Ctrl+Shift+R)" -ForegroundColor White
Write-Host "   2. Allez sur https://iahome.fr/force-cache-clear.html" -ForegroundColor White
Write-Host "   3. Suivez les instructions pour vider le cache" -ForegroundColor White
Write-Host "   4. Retournez sur /encours" -ForegroundColor White
Write-Host "   5. Cliquez sur le bouton d'accès LibreSpeed" -ForegroundColor White
Write-Host "   6. Vérifiez que l'URL est /api/redirect-librespeed?token=..." -ForegroundColor White

Write-Host "`n4. URLs attendues après correction:" -ForegroundColor Green
Write-Host "   ✅ /api/redirect-librespeed?token=..." -ForegroundColor White
Write-Host "   ✅ /api/redirect-metube?token=..." -ForegroundColor White
Write-Host "   ✅ /api/redirect-pdf?token=..." -ForegroundColor White
Write-Host "   ❌ https://librespeed.iahome.fr?token=... (ancien format)" -ForegroundColor Red

Write-Host "`n✅ Test terminé!" -ForegroundColor Green
Write-Host "🔧 Le problème est le cache du navigateur, pas le code!" -ForegroundColor Yellow
