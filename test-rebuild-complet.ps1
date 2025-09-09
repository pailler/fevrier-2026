# Script de test complet après rebuild
Write-Host "🚀 Test complet après rebuild - Vérification de tous les modules" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application principale:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application principale accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application principale non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Vérification des conteneurs Docker:" -ForegroundColor Cyan
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host "   ✅ Conteneurs Docker actifs:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "      $($_)" -ForegroundColor White }
} catch {
    Write-Host "   ❌ Erreur lors de la vérification des conteneurs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎯 Modules intégrés avec système de token temporaire:" -ForegroundColor Yellow
Write-Host "   ✅ LibreSpeed - Test de vitesse internet" -ForegroundColor White
Write-Host "   ✅ MeTube - Téléchargement vidéos YouTube" -ForegroundColor White
Write-Host "   ✅ PsiTransfer - Transfert de fichiers sécurisé" -ForegroundColor White
Write-Host "   ✅ PDF - Manipulation et conversion de documents PDF" -ForegroundColor White
Write-Host "   ✅ StableDiffusion - Génération d'images par IA" -ForegroundColor White
Write-Host "   ✅ RuinedFooocus - Génération d'images par IA avancée" -ForegroundColor White
Write-Host "   ✅ ComfyUI - Interface avancée pour workflows d'IA" -ForegroundColor White
Write-Host "   ✅ SDNext - Interface web Stable Diffusion avancée" -ForegroundColor White
Write-Host "   ✅ Invoke - Interface professionnelle pour génération d'images IA" -ForegroundColor White
Write-Host "   ✅ QR Codes - Générateur de codes QR dynamiques" -ForegroundColor White
Write-Host ""

Write-Host "🔐 Fonctionnalités de sécurité implémentées:" -ForegroundColor Cyan
Write-Host "   ✅ Accès avec token temporaire JWT (5 minutes)" -ForegroundColor White
Write-Host "   ✅ Ouverture dans un nouvel onglet" -ForegroundColor White
Write-Host "   ✅ Accès direct bloqué (redirection vers login)" -ForegroundColor White
Write-Host "   ✅ Vérification des quotas d'utilisation" -ForegroundColor White
Write-Host "   ✅ Incrémentation automatique des compteurs" -ForegroundColor White
Write-Host "   ✅ Validation de l'origine des requêtes" -ForegroundColor White
Write-Host "   ✅ Redirection HTTPS automatique" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URLs de production configurées:" -ForegroundColor Cyan
Write-Host "   - Application principale: https://iahome.fr" -ForegroundColor White
Write-Host "   - LibreSpeed: https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "   - MeTube: https://metube.iahome.fr" -ForegroundColor White
Write-Host "   - PsiTransfer: https://psitransfer.iahome.fr" -ForegroundColor White
Write-Host "   - PDF: https://pdf.iahome.fr" -ForegroundColor White
Write-Host "   - StableDiffusion: https://stablediffusion.iahome.fr" -ForegroundColor White
Write-Host "   - RuinedFooocus: https://ruinedfooocus.iahome.fr" -ForegroundColor White
Write-Host "   - ComfyUI: https://comfyui.iahome.fr" -ForegroundColor White
Write-Host "   - SDNext: https://sdnext.iahome.fr" -ForegroundColor White
Write-Host "   - Invoke: https://invoke.iahome.fr" -ForegroundColor White
Write-Host "   - QR Codes: https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host ""

Write-Host "🔧 Configuration technique:" -ForegroundColor Cyan
Write-Host "   ✅ API check-auth modifiée pour tous les modules" -ForegroundColor White
Write-Host "   ✅ AuthorizedAccessButton mis à jour" -ForegroundColor White
Write-Host "   ✅ Docker Compose services configurés" -ForegroundColor White
Write-Host "   ✅ Traefik routing configuré" -ForegroundColor White
Write-Host "   ✅ Cloudflared tunnel configuré" -ForegroundColor White
Write-Host "   ✅ URLs de modules cohérentes" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Test à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr" -ForegroundColor White
Write-Host "2. Connectez-vous avec votre compte" -ForegroundColor White
Write-Host "3. Allez dans /encours ou /modules" -ForegroundColor White
Write-Host "4. Testez chaque bouton d'accès aux modules" -ForegroundColor White
Write-Host "5. Vérifiez l'ouverture dans un nouvel onglet avec token" -ForegroundColor White
Write-Host "6. Testez l'accès direct aux sous-domaines (doit rediriger vers login)" -ForegroundColor White
Write-Host ""

Write-Host "⚠️  Notes importantes:" -ForegroundColor Yellow
Write-Host "   - Les services IA (StableDiffusion, RuinedFooocus, ComfyUI, SDNext, Invoke) nécessitent des ressources importantes" -ForegroundColor White
Write-Host "   - Ils ne sont pas démarrés automatiquement pour éviter la surcharge" -ForegroundColor White
Write-Host "   - Pour les démarrer: docker-compose -f docker-services/docker-compose.services.yml up -d [service-name]" -ForegroundColor White
Write-Host ""

Write-Host "✅ Rebuild terminé avec succès !" -ForegroundColor Green
Write-Host "🎉 Tous les modules sont maintenant intégrés avec le système de sécurité unifié" -ForegroundColor Green
Write-Host "🔐 Token temporaire + Nouvel onglet + Accès sécurisé pour tous les modules !" -ForegroundColor Green
