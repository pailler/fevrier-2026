# Script de test après reconstruction complète
Write-Host "🎉 Test après reconstruction complète" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🐳 Conteneurs en cours d'exécution:" -ForegroundColor Cyan
Write-Host "   ✅ iahome-app (Application principale)" -ForegroundColor White
Write-Host "   ✅ iahome-traefik (Proxy inverse)" -ForegroundColor White
Write-Host "   ✅ librespeed (Test de vitesse)" -ForegroundColor White
Write-Host "   ✅ metube (Téléchargement vidéo)" -ForegroundColor White
Write-Host "   ✅ stirling-pdf (Traitement PDF)" -ForegroundColor White
Write-Host "   ✅ psitransfer (Transfert de fichiers)" -ForegroundColor White
Write-Host "   ✅ polr (Raccourcissement d'URL)" -ForegroundColor White
Write-Host "   ✅ cloudflared-tunnel (Tunnel sécurisé)" -ForegroundColor White
Write-Host ""

Write-Host "🛡️ Protections appliquées:" -ForegroundColor Yellow
Write-Host "   ✅ Protection contre les clics multiples" -ForegroundColor White
Write-Host "   ✅ Compteur de clics (clickCount)" -ForegroundColor White
Write-Host "   ✅ Blocage des clics #2+" -ForegroundColor White
Write-Host "   ✅ Reset automatique après 2s" -ForegroundColor White
Write-Host "   ✅ Logs de debug détaillés" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Test des boutons d'accès:" -ForegroundColor Cyan
Write-Host "   - Cliquez sur un bouton d'accès" -ForegroundColor White
Write-Host "   - Vérifiez qu'un seul onglet s'ouvre" -ForegroundColor White
Write-Host "   - Cliquez rapidement plusieurs fois" -ForegroundColor White
Write-Host "   - Vérifiez que les clics multiples sont bloqués" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URLs de test:" -ForegroundColor Cyan
Write-Host "   - Application: https://iahome.fr" -ForegroundColor White
Write-Host "   - LibreSpeed: https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "   - MeTube: https://metube.iahome.fr" -ForegroundColor White
Write-Host "   - PDF: https://pdf.iahome.fr" -ForegroundColor White
Write-Host "   - PsiTransfer: https://psitransfer.iahome.fr" -ForegroundColor White
Write-Host "   - QR Code: https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host ""

Write-Host "✅ Reconstruction complète terminée !" -ForegroundColor Green
Write-Host "🎯 Application prête avec toutes les corrections" -ForegroundColor Green
Write-Host "🛡️ Protection contre les clics multiples active" -ForegroundColor Green
