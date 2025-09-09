# Script pour configurer les règles d'ingress Cloudflare
# PDF et MeTube

Write-Host "🔧 Configuration des règles d'ingress Cloudflare pour PDF et MeTube" -ForegroundColor Green

Write-Host "`n📋 INSTRUCTIONS POUR CONFIGURER LES RÈGLES D'INGRESS:" -ForegroundColor Cyan

Write-Host "`n1. Aller sur Cloudflare Dashboard:" -ForegroundColor Yellow
Write-Host "   https://dash.cloudflare.com" -ForegroundColor White

Write-Host "`n2. Sélectionner votre compte et le domaine iahome.fr" -ForegroundColor Yellow

Write-Host "`n3. Aller dans Zero Trust > Access > Tunnels" -ForegroundColor Yellow

Write-Host "`n4. Sélectionner le tunnel 'iahome-tunnel' (ID: b19084f4-e2d6-47f5-81c3-0972662e953c)" -ForegroundColor Yellow

Write-Host "`n5. Cliquer sur 'Configure' pour configurer les règles d'ingress" -ForegroundColor Yellow

Write-Host "`n6. AJOUTER les règles suivantes (dans l'ordre):" -ForegroundColor Green

Write-Host "`n   RÈGLE 1 - PDF:" -ForegroundColor Cyan
Write-Host "   Hostname: pdf.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:8081" -ForegroundColor White

Write-Host "`n   RÈGLE 2 - MeTube:" -ForegroundColor Cyan
Write-Host "   Hostname: metube.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:8082" -ForegroundColor White

Write-Host "`n   RÈGLE 3 - PsiTransfer:" -ForegroundColor Cyan
Write-Host "   Hostname: psitransfer.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:8084" -ForegroundColor White

Write-Host "`n   RÈGLE 4 - QR Codes:" -ForegroundColor Cyan
Write-Host "   Hostname: qrcodes.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:8086" -ForegroundColor White

Write-Host "`n   RÈGLE 5 - API:" -ForegroundColor Cyan
Write-Host "   Hostname: api.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:3000" -ForegroundColor White

Write-Host "`n   RÈGLE 6 - Stable Diffusion:" -ForegroundColor Cyan
Write-Host "   Hostname: stablediffusion.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:8085" -ForegroundColor White

Write-Host "`n   RÈGLE 7 - Test:" -ForegroundColor Cyan
Write-Host "   Hostname: test.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:3000" -ForegroundColor White

Write-Host "`n   RÈGLE 8 - Traefik Dashboard:" -ForegroundColor Cyan
Write-Host "   Hostname: traefik.iahome.fr" -ForegroundColor White
Write-Host "   Service: http://192.168.1.150:8080" -ForegroundColor White

Write-Host "`n   RÈGLE 9 - Catch-all (déjà configurée):" -ForegroundColor Gray
Write-Host "   Service: http_status:404" -ForegroundColor Gray

Write-Host "`n7. Sauvegarder la configuration" -ForegroundColor Yellow

Write-Host "`n8. Attendre 1-2 minutes pour la propagation" -ForegroundColor Yellow

Write-Host "`n9. Tester les services:" -ForegroundColor Green
Write-Host "   - https://pdf.iahome.fr" -ForegroundColor White
Write-Host "   - https://metube.iahome.fr" -ForegroundColor White
Write-Host "   - https://psitransfer.iahome.fr" -ForegroundColor White
Write-Host "   - https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host "   - https://api.iahome.fr" -ForegroundColor White
Write-Host "   - https://stablediffusion.iahome.fr" -ForegroundColor White
Write-Host "   - https://test.iahome.fr" -ForegroundColor White
Write-Host "   - https://traefik.iahome.fr" -ForegroundColor White

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "Tous les services seront accessibles via HTTPS" -ForegroundColor Cyan
