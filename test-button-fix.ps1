# Script de test pour vérifier la correction du bouton d'accès

Write-Host "🧪 Test de la correction du bouton d'accès" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Cyan

Write-Host "`n1. Vérification des routes de redirection..." -ForegroundColor Yellow

$redirectRoutes = @(
    "src/app/api/redirect-librespeed/route.ts",
    "src/app/api/redirect-metube/route.ts", 
    "src/app/api/redirect-pdf/route.ts",
    "src/app/api/redirect-psitransfer/route.ts",
    "src/app/api/redirect-qrcodes/route.ts",
    "src/app/api/redirect-converter/route.ts"
)

foreach ($route in $redirectRoutes) {
    if (Test-Path $route) {
        Write-Host "   ✅ $route" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $route manquant" -ForegroundColor Red
    }
}

Write-Host "`n2. Vérification de la fonction getModuleUrl..." -ForegroundColor Yellow

$encoursFile = "src/app/encours/page.tsx"
if (Test-Path $encoursFile) {
    $content = Get-Content $encoursFile -Raw
    if ($content -match "secureRedirectUrls") {
        Write-Host "   ✅ getModuleUrl utilise les routes sécurisées" -ForegroundColor Green
    } else {
        Write-Host "   ❌ getModuleUrl utilise encore les URLs directes" -ForegroundColor Red
    }
} else {
    Write-Host "   ❌ Fichier encours/page.tsx manquant" -ForegroundColor Red
}

Write-Host "`n3. Vérification des APIs de notification..." -ForegroundColor Yellow

$notificationApis = @(
    "src/app/api/test-notification/route.ts",
    "src/app/api/test-notification-generic/route.ts"
)

foreach ($api in $notificationApis) {
    if (Test-Path $api) {
        Write-Host "   ✅ $api" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $api manquant" -ForegroundColor Red
    }
}

Write-Host "`n4. Instructions de test:" -ForegroundColor Cyan
Write-Host "   1. Connectez-vous à iahome.fr" -ForegroundColor White
Write-Host "   2. Allez sur la page /encours" -ForegroundColor White
Write-Host "   3. Cliquez sur 'Accéder à l'application' pour LibreSpeed" -ForegroundColor White
Write-Host "   4. Vérifiez que vous êtes redirigé vers LibreSpeed (pas la page d'accueil)" -ForegroundColor White
Write-Host "   5. Vérifiez les logs de la console pour les messages de debug" -ForegroundColor White

Write-Host "`n5. URLs attendues après correction:" -ForegroundColor Magenta
Write-Host "   - LibreSpeed: /api/redirect-librespeed" -ForegroundColor White
Write-Host "   - MeTube: /api/redirect-metube" -ForegroundColor White
Write-Host "   - PDF: /api/redirect-pdf" -ForegroundColor White
Write-Host "   - PsiTransfer: /api/redirect-psitransfer" -ForegroundColor White
Write-Host "   - QR Codes: /api/redirect-qrcodes" -ForegroundColor White
Write-Host "   - Converter: /api/redirect-converter" -ForegroundColor White

Write-Host "`n✅ Test de correction terminé!" -ForegroundColor Green
Write-Host "🔧 Le bouton d'accès devrait maintenant rediriger correctement vers les applications" -ForegroundColor Yellow

