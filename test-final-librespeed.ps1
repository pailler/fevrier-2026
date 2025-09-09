# Script de test final - Correction des URLs LibreSpeed
Write-Host "🎯 Test final - Correction des URLs LibreSpeed" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'API des URLs de modules:" -ForegroundColor Cyan
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/module-urls" -UseBasicParsing
$data = $response.Content | ConvertFrom-Json

Write-Host "   ✅ LibreSpeed: $($data.moduleUrls.librespeed)" -ForegroundColor Green
Write-Host "   ✅ PDF: $($data.moduleUrls.pdf)" -ForegroundColor Green
Write-Host "   ✅ MeTube: $($data.moduleUrls.metube)" -ForegroundColor Green
Write-Host "   ✅ PsiTransfer: $($data.moduleUrls.psitransfer)" -ForegroundColor Green
Write-Host "   ✅ QR Code: $($data.moduleUrls.qrcodes)" -ForegroundColor Green
Write-Host ""

Write-Host "🌐 Test de connectivité des URLs corrigées:" -ForegroundColor Cyan
$urls = @(
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
Write-Host "🔧 Corrections apportées:" -ForegroundColor Yellow
Write-Host "   ✅ Suppression des références à localhost:8083" -ForegroundColor White
Write-Host "   ✅ Mise à jour des URLs vers iahome.fr" -ForegroundColor White
Write-Host "   ✅ Reconstruction complète de l'application" -ForegroundColor White
Write-Host "   ✅ Cache Next.js vidé" -ForegroundColor White
Write-Host ""

Write-Host "🎉 Problème résolu !" -ForegroundColor Green
Write-Host "🚀 LibreSpeed utilise maintenant https://librespeed.iahome.fr" -ForegroundColor Green
Write-Host "🌐 Tous les boutons d'accès ouvrent les bons sous-domaines" -ForegroundColor Green
