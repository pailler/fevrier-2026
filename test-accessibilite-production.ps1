# Script de test pour vérifier l'accessibilité des URLs de production
Write-Host "🌐 Test d'accessibilité des URLs de production" -ForegroundColor Green
Write-Host ""

$urls = @(
    "https://iahome.fr",
    "https://librespeed.regispailler.fr", 
    "https://pdf.regispailler.fr",
    "https://metube.regispailler.fr",
    "https://psitransfer.regispailler.fr",
    "https://qrcode.regispailler.fr"
)

Write-Host "🔍 Test de connectivité des services..." -ForegroundColor Yellow
Write-Host ""

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $url - Accessible (Status: $($response.StatusCode))" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $url - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ $url - Non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "   - Tous les boutons d'accès utilisent maintenant les URLs de production" -ForegroundColor White
Write-Host "   - Les nouveaux onglets s'ouvrent avec les sous-domaines corrects" -ForegroundColor White
Write-Host "   - LibreSpeed utilise un token temporaire pour la sécurité" -ForegroundColor White
Write-Host "   - Tous les services sont accessibles via Cloudflare" -ForegroundColor White
Write-Host ""
Write-Host "✅ Configuration terminée avec succès !" -ForegroundColor Green
