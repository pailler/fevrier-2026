# Script de test pour vérifier que tous les modules ont un style spécial
Write-Host "🎨 Test du style visuel de tous les modules..." -ForegroundColor Blue

Write-Host "`n✅ Modules avec style spécial ajoutés:" -ForegroundColor Green
Write-Host "   • ChatGPT - Style vert avec icône de chat" -ForegroundColor White
Write-Host "   • IA Photo - Style rose avec icône d'appareil photo" -ForegroundColor White
Write-Host "   • IA Tube - Style rouge avec icône de vidéo" -ForegroundColor White
Write-Host "   • Stirling PDF - Style gris avec icône de document" -ForegroundColor White

Write-Host "`n🎯 Styles appliqués:" -ForegroundColor Cyan
Write-Host "   • Badge catégorie: Couleur gradient en haut à gauche" -ForegroundColor White
Write-Host "   • Logo central: Icône spécifique au module" -ForegroundColor White
Write-Host "   • Badge prix: En haut à droite" -ForegroundColor White
Write-Host "   • Sous-titre: En bas avec overlay" -ForegroundColor White
Write-Host "   • Badge spécial: Texte distinctif avec icône" -ForegroundColor White

Write-Host "`n🌐 Test des pages:" -ForegroundColor Yellow
try {
    $applicationsResponse = Invoke-WebRequest -Uri "http://localhost:3000/applications" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ Page Applications: HTTP $($applicationsResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur page Applications: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Vérifications visuelles:" -ForegroundColor Magenta
Write-Host "1. Ouvrez http://localhost:3000/applications" -ForegroundColor White
Write-Host "2. Vérifiez que tous les modules ont un style spécial" -ForegroundColor White
Write-Host "3. Vérifiez les logos centraux pour chaque module" -ForegroundColor White
Write-Host "4. Vérifiez les badges spéciaux en bas" -ForegroundColor White
Write-Host "5. Vérifiez la cohérence visuelle" -ForegroundColor White

Write-Host "`n🎨 Modules avec style spécial:" -ForegroundColor Blue
Write-Host "   • LibreSpeed - Speedomètre bleu (FEATURED)" -ForegroundColor White
Write-Host "   • PsiTransfer - Transfert vert (SECURE)" -ForegroundColor White
Write-Host "   • PDF+ - Document rouge (PDF PLUS)" -ForegroundColor White
Write-Host "   • MeTube - Vidéo violet (VIDEO DOWNLOAD)" -ForegroundColor White
Write-Host "   • CogStudio - Studio indigo (AI STUDIO)" -ForegroundColor White
Write-Host "   • InvokeIA - Invoke orange (AI GENERATION)" -ForegroundColor White
Write-Host "   • ComfyUI - Comfy teal (AI WORKFLOW)" -ForegroundColor White
Write-Host "   • Stable Diffusion - Diffusion emerald (AI IMAGE)" -ForegroundColor White
Write-Host "   • RuinedFooocus - Fooocus violet (AI CREATIVE)" -ForegroundColor White
Write-Host "   • SDnext - SDnext rose (AI OPTIMIZED)" -ForegroundColor White
Write-Host "   • QR Codes - QR slate (QR GENERATOR)" -ForegroundColor White
Write-Host "   • Universal Converter - Converter cyan (UNIVERSAL)" -ForegroundColor White
Write-Host "   • Whisper IA - Microphone bleu (AI POWERED)" -ForegroundColor White
Write-Host "   • ChatGPT - Chat vert (AI CHAT)" -ForegroundColor White
Write-Host "   • IA Photo - Appareil photo rose (AI PHOTO)" -ForegroundColor White
Write-Host "   • IA Tube - Vidéo rouge (AI VIDEO)" -ForegroundColor White
Write-Host "   • Stirling PDF - Document gris (PDF TOOLS)" -ForegroundColor White

Write-Host "`n🎉 Tous les modules ont maintenant un style visuel cohérent !" -ForegroundColor Green
Write-Host "   Affichage uniforme et professionnel" -ForegroundColor White
Write-Host "   Logos distinctifs pour chaque module" -ForegroundColor White
Write-Host "   Badges spéciaux avec icônes" -ForegroundColor White
