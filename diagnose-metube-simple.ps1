# Script de diagnostic simple pour MeTube
Write-Host "Diagnostic de la connexion MeTube" -ForegroundColor Cyan

Write-Host "`nProbleme identifie :" -ForegroundColor Red
Write-Host "   Let's Encrypt ne peut pas obtenir le certificat SSL" -ForegroundColor Gray
Write-Host "   Erreur: DNS problem: NXDOMAIN looking up A for metube.iahome.fr" -ForegroundColor Gray
Write-Host "   Cause: Le domaine metube.iahome.fr n'existe pas dans le DNS" -ForegroundColor Gray

Write-Host "`n1. Verification de la resolution DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "metube.iahome.fr" -ErrorAction Stop
    Write-Host "DNS resolu: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "DNS NON RESOLU - C'est le probleme principal !" -ForegroundColor Red
    Write-Host "   Le domaine metube.iahome.fr n'existe pas dans le DNS" -ForegroundColor Gray
}

Write-Host "`n2. Verification de l'IP publique..." -ForegroundColor Yellow
try {
    $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 10
    Write-Host "Votre IP publique: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "Impossible de recuperer l'IP publique" -ForegroundColor Red
}

Write-Host "`n3. Test de connectivite locale..." -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:8082" -Method GET -TimeoutSec 5
    if ($localResponse.StatusCode -eq 200) {
        Write-Host "MeTube accessible localement sur le port 8082" -ForegroundColor Green
    } else {
        Write-Host "MeTube non accessible localement (Code: $($localResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur de connexion locale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nSOLUTION REQUISE :" -ForegroundColor Yellow
Write-Host "`n1. Configurez le DNS dans Cloudflare :" -ForegroundColor White
Write-Host "   - Connectez-vous a https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "   - Selectionnez le domaine 'iahome.fr'" -ForegroundColor Gray
Write-Host "   - Allez dans l'onglet 'DNS'" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'Add record'" -ForegroundColor Gray
Write-Host "   - Type: A" -ForegroundColor Gray
Write-Host "   - Name: metube" -ForegroundColor Gray
Write-Host "   - IPv4 address: [VOTRE_IP_PUBLIQUE]" -ForegroundColor Gray
Write-Host "   - Proxy status: (orange cloud active)" -ForegroundColor Gray
Write-Host "   - TTL: Auto" -ForegroundColor Gray

Write-Host "`n2. Attendez la propagation DNS (2-5 minutes)" -ForegroundColor White

Write-Host "`n3. Testez la configuration :" -ForegroundColor White
Write-Host "   powershell -ExecutionPolicy Bypass -File test-metube-config.ps1" -ForegroundColor Gray

Write-Host "`n4. Accedez a MeTube :" -ForegroundColor White
Write-Host "   https://metube.iahome.fr" -ForegroundColor Gray

Write-Host "`nIMPORTANT :" -ForegroundColor Red
Write-Host "   Sans configuration DNS, Let's Encrypt ne peut pas generer le certificat SSL" -ForegroundColor Gray
Write-Host "   et l'acces a metube.iahome.fr ne fonctionnera pas." -ForegroundColor Gray

Write-Host "`nDiagnostic termine" -ForegroundColor Green

