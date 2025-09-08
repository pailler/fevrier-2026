# Configuration DNS pour PDF
Write-Host "Configuration DNS pour PDF" -ForegroundColor Cyan

Write-Host "`nÉtapes pour configurer pdf.iahome.fr :" -ForegroundColor Yellow

Write-Host "`n1. Aller sur Cloudflare DNS :" -ForegroundColor Green
Write-Host "   https://dash.cloudflare.com" -ForegroundColor White
Write-Host "   Sélectionner le domaine iahome.fr" -ForegroundColor White

Write-Host "`n2. Ajouter un enregistrement A :" -ForegroundColor Green
Write-Host "   Type: A" -ForegroundColor White
Write-Host "   Nom: pdf" -ForegroundColor White
Write-Host "   IPv4: VOTRE_IP_PUBLIQUE" -ForegroundColor White
Write-Host "   Proxy: Activé (nuage orange)" -ForegroundColor White

Write-Host "`n3. Vérifier la configuration :" -ForegroundColor Green
Write-Host "   L'enregistrement doit ressembler à :" -ForegroundColor White
Write-Host "   pdf.iahome.fr -> VOTRE_IP_PUBLIQUE (proxied)" -ForegroundColor White

Write-Host "`n4. Attendre la propagation DNS (1-5 minutes)" -ForegroundColor Green

Write-Host "`n5. Tester l'accès :" -ForegroundColor Green
Write-Host "   https://pdf.iahome.fr" -ForegroundColor White

Write-Host "`nConfiguration Traefik déjà prête :" -ForegroundColor Yellow
Write-Host "✅ Route pdf.iahome.fr configurée" -ForegroundColor Green
Write-Host "✅ Service stirling-pdf:8080 configuré" -ForegroundColor Green
Write-Host "✅ Middlewares security-headers et compress" -ForegroundColor Green
Write-Host "✅ SSL via Cloudflare" -ForegroundColor Green

Write-Host "`nUne fois le DNS configuré, vous pourrez :" -ForegroundColor Yellow
Write-Host "1. Accéder à https://pdf.iahome.fr" -ForegroundColor White
Write-Host "2. Configurer le bouton d'accès comme LibreSpeed/MeTube" -ForegroundColor White
Write-Host "3. Tester l'intégration complète" -ForegroundColor White

Write-Host "`n✅ Instructions DNS fournies !" -ForegroundColor Green
Write-Host "   Configurez le DNS puis testez l'accès" -ForegroundColor Gray

