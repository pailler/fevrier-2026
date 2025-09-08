# Configuration DNS pour qrcodes.iahome.fr
Write-Host "Configuration DNS pour qrcodes.iahome.fr" -ForegroundColor Cyan

Write-Host "`nErreur detectee : DNS_PROBE_FINISHED_NXDOMAIN" -ForegroundColor Red
Write-Host "Le DNS pour qrcodes.iahome.fr n'est pas configure dans Cloudflare" -ForegroundColor Yellow

Write-Host "`nConfiguration Traefik verifiee :" -ForegroundColor Green
Write-Host "- Reverse proxy : qrcodes.iahome.fr -> host.docker.internal:7005" -ForegroundColor Gray
Write-Host "- SSL : Cloudflare (meme approche que les autres modules)" -ForegroundColor Gray
Write-Host "- Middlewares : security-headers, compress" -ForegroundColor Gray

Write-Host "`nEtapes pour configurer le DNS :" -ForegroundColor Yellow
Write-Host "1. Connectez-vous a votre compte Cloudflare" -ForegroundColor White
Write-Host "2. Selectionnez le domaine iahome.fr" -ForegroundColor White
Write-Host "3. Allez dans l'onglet DNS > Enregistrements" -ForegroundColor White
Write-Host "4. Cliquez sur Ajouter un enregistrement" -ForegroundColor White
Write-Host "5. Configurez l'enregistrement :" -ForegroundColor White
Write-Host "   - Type : A" -ForegroundColor Gray
Write-Host "   - Nom : qrcodes" -ForegroundColor Gray
Write-Host "   - IPv4 : VOTRE_IP_PUBLIQUE" -ForegroundColor Gray
Write-Host "   - Proxy : Active (nuage orange)" -ForegroundColor Gray
Write-Host "6. Cliquez sur Enregistrer" -ForegroundColor White

Write-Host "`nVerification de l'IP publique :" -ForegroundColor Yellow
try {
    $ipResponse = Invoke-WebRequest -Uri "https://api.ipify.org" -Method GET -TimeoutSec 10
    if ($ipResponse.StatusCode -eq 200) {
        $publicIP = $ipResponse.Content.Trim()
        Write-Host "Votre IP publique : $publicIP" -ForegroundColor Green
        Write-Host "Utilisez cette IP pour l'enregistrement DNS" -ForegroundColor Gray
    } else {
        Write-Host "Impossible de recuperer l'IP publique" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la recuperation de l'IP : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nResume de la configuration DNS :" -ForegroundColor Yellow
Write-Host "   Type : A" -ForegroundColor White
Write-Host "   Nom : qrcodes" -ForegroundColor White
Write-Host "   IPv4 : [VOTRE_IP_PUBLIQUE]" -ForegroundColor White
Write-Host "   Proxy : Active (nuage orange)" -ForegroundColor White
Write-Host "   TTL : Auto" -ForegroundColor White

Write-Host "`nTemps de propagation DNS :" -ForegroundColor Yellow
Write-Host "   - Propagation locale : 1-5 minutes" -ForegroundColor Gray
Write-Host "   - Propagation globale : 5-15 minutes" -ForegroundColor Gray
Write-Host "   - Propagation complete : jusqu'a 24h" -ForegroundColor Gray

Write-Host "`nTest apres configuration :" -ForegroundColor Yellow
Write-Host "1. Attendez 5-10 minutes apres la configuration DNS" -ForegroundColor White
Write-Host "2. Testez : https://qrcodes.iahome.fr" -ForegroundColor White
Write-Host "3. Verifiez que la page se charge correctement" -ForegroundColor White
Write-Host "4. Testez le bouton Activer l'application QR Codes" -ForegroundColor White

Write-Host "`nModules deja configures :" -ForegroundColor Yellow
Write-Host "iahome.fr (principal)" -ForegroundColor Green
Write-Host "librespeed.iahome.fr" -ForegroundColor Green
Write-Host "metube.iahome.fr" -ForegroundColor Green
Write-Host "pdf.iahome.fr" -ForegroundColor Green
Write-Host "psitransfer.iahome.fr" -ForegroundColor Green
Write-Host "qrcodes.iahome.fr (a configurer)" -ForegroundColor Red

Write-Host "`nUne fois le DNS configure :" -ForegroundColor Yellow
Write-Host "   - qrcodes.iahome.fr sera accessible" -ForegroundColor Gray
Write-Host "   - Le bouton Activer l'application QR Codes fonctionnera" -ForegroundColor Gray
Write-Host "   - Le module apparaîtra dans /encours" -ForegroundColor Gray
Write-Host "   - L'ouverture en nouvel onglet fonctionnera" -ForegroundColor Gray

Write-Host "`nNote importante :" -ForegroundColor Yellow
Write-Host "   La configuration Traefik est deja prete" -ForegroundColor Gray
Write-Host "   Il ne reste que la configuration DNS dans Cloudflare" -ForegroundColor Gray
Write-Host "   Une fois configure, tout fonctionnera immediatement" -ForegroundColor Gray

