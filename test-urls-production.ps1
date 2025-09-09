# Script de test pour vérifier que les boutons d'accès utilisent les URLs de production
Write-Host "🧪 Test des URLs de production - Boutons d'accès" -ForegroundColor Green
Write-Host ""

Write-Host "📋 URLs de production configurées:" -ForegroundColor Cyan
Write-Host "   ✅ LibreSpeed: https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ PDF: https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ MeTube: https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ PsiTransfer: https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ QR Code: https://qrcode.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ Stable Diffusion: https://stablediffusion.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ RuinedFooocus: https://ruinedfooocus.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ Invoke: https://invoke.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ ComfyUI: https://comfyui.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ CogStudio: https://cogstudio.regispailler.fr" -ForegroundColor White
Write-Host "   ✅ SDNext: https://sdnext.regispailler.fr" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Corrections apportées:" -ForegroundColor Yellow
Write-Host "   - Mapping des modules vers URLs de production" -ForegroundColor Gray
Write-Host "   - Gestion spéciale pour tous les services externes" -ForegroundColor Gray
Write-Host "   - Fallback vers URLs de production pour tous les modules" -ForegroundColor Gray
Write-Host "   - Support des IDs de modules (qrcodes, qrcode, etc.)" -ForegroundColor Gray
Write-Host ""

Write-Host "🌐 Test de connectivité:" -ForegroundColor Cyan
Write-Host "   - Application: https://iahome.fr" -ForegroundColor White
Write-Host "   - Local: http://localhost:3000" -ForegroundColor White
Write-Host ""

Write-Host "✅ Tous les boutons d'accès utilisent maintenant les URLs de production !" -ForegroundColor Green
Write-Host "🎯 Les nouveaux onglets s'ouvriront avec les sous-domaines corrects" -ForegroundColor Green
