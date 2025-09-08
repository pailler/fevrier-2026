# Script de configuration DNS pour MeTube
Write-Host "🔧 Configuration DNS pour MeTube" -ForegroundColor Cyan

Write-Host "`n📋 Étapes à suivre dans Cloudflare :" -ForegroundColor Yellow
Write-Host "1. Connectez-vous à votre dashboard Cloudflare" -ForegroundColor White
Write-Host "2. Sélectionnez le domaine 'iahome.fr'" -ForegroundColor White
Write-Host "3. Allez dans l'onglet 'DNS'" -ForegroundColor White
Write-Host "4. Ajoutez un enregistrement A :" -ForegroundColor White
Write-Host "   - Type: A" -ForegroundColor Gray
Write-Host "   - Nom: metube" -ForegroundColor Gray
Write-Host "   - IPv4: [VOTRE_IP_PUBLIQUE]" -ForegroundColor Gray
Write-Host "   - Proxy: ✅ (orange cloud activé)" -ForegroundColor Gray
Write-Host "   - TTL: Auto" -ForegroundColor Gray

Write-Host "`n🌐 Vérification de l'IP publique..." -ForegroundColor Yellow
try {
    $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 10
    Write-Host "✅ Votre IP publique est: $publicIP" -ForegroundColor Green
    Write-Host "   Utilisez cette IP pour l'enregistrement DNS" -ForegroundColor Gray
} catch {
    Write-Host "❌ Impossible de récupérer l'IP publique" -ForegroundColor Red
    Write-Host "   Vous pouvez la récupérer sur https://whatismyipaddress.com/" -ForegroundColor Gray
}

Write-Host "`n⏳ Après avoir configuré le DNS, attendez 2-3 minutes puis testez :" -ForegroundColor Yellow
Write-Host "   https://metube.iahome.fr" -ForegroundColor White

Write-Host "`n🔍 Test de résolution DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "metube.iahome.fr" -ErrorAction Stop
    Write-Host "✅ DNS résolu: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "❌ DNS non résolu - Le domaine n'existe pas encore" -ForegroundColor Red
    Write-Host "   Configurez d'abord le DNS dans Cloudflare" -ForegroundColor Gray
}

Write-Host "`n📝 Configuration Traefik créée :" -ForegroundColor Green
Write-Host "   - Fichier: traefik/dynamic/metube-cloudflare.yml" -ForegroundColor Gray
Write-Host "   - Domaine: metube.iahome.fr" -ForegroundColor Gray
Write-Host "   - SSL: Let's Encrypt" -ForegroundColor Gray
Write-Host "   - Service: http://metube:8081" -ForegroundColor Gray

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green

