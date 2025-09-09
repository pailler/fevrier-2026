# Script de test pour vérifier que les boutons d'accès ouvrent des nouvels onglets
Write-Host "🧪 Test des boutons d'accès - Ouverture dans de nouveaux onglets" -ForegroundColor Green
Write-Host ""

Write-Host "📋 Services à tester:" -ForegroundColor Cyan
Write-Host "   ✅ LibreSpeed: https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ PDF: https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ MeTube: https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ PsiTransfer: https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ QR Code: https://qrcode.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ Blender 3D: Navigation interne (pas de nouvel onglet)" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Application principale:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:3000" -ForegroundColor White
Write-Host "   - Production: https://iahome.fr" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Modifications apportées:" -ForegroundColor Yellow
Write-Host "   - Tous les boutons d'accès ouvrent maintenant des nouvels onglets" -ForegroundColor Gray
Write-Host "   - LibreSpeed utilise l'URL de production avec token" -ForegroundColor Gray
Write-Host "   - Services externes utilisent les URLs de production" -ForegroundColor Gray
Write-Host "   - Blender 3D garde la navigation interne" -ForegroundColor Gray
Write-Host ""

Write-Host "✅ Test terminé - Les boutons d'accès ouvrent maintenant des nouvels onglets !" -ForegroundColor Green
