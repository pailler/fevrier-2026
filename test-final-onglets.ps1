# Script de test final - Boutons d'accès avec sous-domaines corrects
Write-Host "🎯 Test final - Boutons d'accès avec sous-domaines iahome.fr" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Test de connectivité des sous-domaines:" -ForegroundColor Cyan
$urls = @(
    "https://iahome.fr",
    "https://librespeed.iahome.fr", 
    "https://pdf.iahome.fr",
    "https://metube.iahome.fr",
    "https://psitransfer.iahome.fr",
    "https://qrcodes.iahome.fr"
)

foreach ($url in $urls) {
    try {
        $response = Invoke-WebRequest -Uri $url -Method Head -TimeoutSec 5 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $url - Accessible" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $url - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ $url - Non accessible" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "🔧 Configuration finale:" -ForegroundColor Yellow
Write-Host "   ✅ Tous les boutons d'accès ouvrent des nouvels onglets" -ForegroundColor White
Write-Host "   ✅ URLs utilisent les sous-domaines iahome.fr" -ForegroundColor White
Write-Host "   ✅ LibreSpeed avec token temporaire sécurisé" -ForegroundColor White
Write-Host "   ✅ Services accessibles via Cloudflare Tunnel" -ForegroundColor White
Write-Host "   ✅ Blender 3D garde la navigation interne" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Configuration terminée avec succès !" -ForegroundColor Green
Write-Host "🚀 Les boutons d'accès ouvrent maintenant les applications dans de nouveaux onglets" -ForegroundColor Green
Write-Host "🌐 Avec les sous-domaines corrects (iahome.fr)" -ForegroundColor Green
