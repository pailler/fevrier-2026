# Script PowerShell pour vérifier la configuration Cloudflare pour n8n.regispailler.fr

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Vérification Cloudflare pour n8n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$domain = "n8n.regispailler.fr"

# Test 1 : Résolution DNS
Write-Host "Test 1 : Résolution DNS" -ForegroundColor Yellow
Write-Host ""

try {
    $dnsResult = Resolve-DnsName -Name $domain -Type A -ErrorAction Stop
    $ip = $dnsResult[0].IPAddress
    
    Write-Host "✅ DNS résolu : $ip" -ForegroundColor Green
    
    # Vérifier si c'est une IP Cloudflare
    $cloudflareIPs = @(
        "104.", "172.16.", "172.17.", "172.18.", "172.19.", "172.20.", "172.21.", 
        "172.22.", "172.23.", "172.24.", "172.25.", "172.26.", "172.27.", 
        "172.28.", "172.29.", "172.30.", "172.31.", "198.41.", "198.51."
    )
    
    $isCloudflare = $false
    foreach ($cfIP in $cloudflareIPs) {
        if ($ip.StartsWith($cfIP)) {
            $isCloudflare = $true
            break
        }
    }
    
    if ($isCloudflare) {
        Write-Host "✅ Proxy Cloudflare actif (IP Cloudflare détectée)" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Proxy Cloudflare peut-être désactivé (IP non-Cloudflare)" -ForegroundColor Yellow
        Write-Host "   → Vérifiez dans Cloudflare Dashboard que le proxy est activé (🟠 orange)" -ForegroundColor Yellow
    }
}
catch {
    Write-Host "❌ Erreur de résolution DNS : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2 : Accès HTTPS
Write-Host "Test 2 : Accès HTTPS" -ForegroundColor Yellow
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "https://$domain/healthz" `
        -Method GET `
        -UseBasicParsing `
        -ErrorAction Stop
    
    Write-Host "✅ HTTPS fonctionne : Status $($response.StatusCode)" -ForegroundColor Green
    
    # Vérifier les headers Cloudflare
    $cfHeaders = $response.Headers.Keys | Where-Object { $_ -like "cf-*" -or $_ -like "CF-*" }
    if ($cfHeaders) {
        Write-Host "✅ Headers Cloudflare détectés :" -ForegroundColor Green
        foreach ($header in $cfHeaders) {
            Write-Host "   - $header" -ForegroundColor White
        }
    } else {
        Write-Host "⚠️  Aucun header Cloudflare détecté" -ForegroundColor Yellow
        Write-Host "   → Le proxy Cloudflare peut ne pas être actif" -ForegroundColor Yellow
    }
    
    # Vérifier le serveur
    if ($response.Headers.Server -like "*cloudflare*") {
        Write-Host "✅ Serveur Cloudflare détecté" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Erreur d'accès HTTPS : $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code : $($_.Exception.Response.StatusCode.value__)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3 : Vérification directe n8n (sur NAS)
Write-Host "Test 3 : Vérification directe n8n (sur NAS)" -ForegroundColor Yellow
Write-Host ""
Write-Host "Sur le NAS, exécutez:" -ForegroundColor White
Write-Host "  curl http://localhost:5678/healthz" -ForegroundColor Gray
Write-Host ""

# Résumé et instructions
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Instructions Cloudflare" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Allez sur : https://dash.cloudflare.com/" -ForegroundColor Yellow
Write-Host "2. Sélectionnez le domaine : regispailler.fr" -ForegroundColor Yellow
Write-Host "3. Allez dans DNS → Records" -ForegroundColor Yellow
Write-Host "4. Trouvez : n8n.regispailler.fr" -ForegroundColor Yellow
Write-Host "5. Vérifiez que l'icône est 🟠 Proxied (orange)" -ForegroundColor Yellow
Write-Host "   Si c'est ⚪ gris, cliquez dessus pour l'activer" -ForegroundColor Yellow
Write-Host "6. Allez dans SSL/TLS → Overview" -ForegroundColor Yellow
Write-Host "7. Mode SSL/TLS : Full ou Full (strict)" -ForegroundColor Yellow
Write-Host "8. Allez dans SSL/TLS → Edge Certificates" -ForegroundColor Yellow
Write-Host "9. Activez 'Always Use HTTPS'" -ForegroundColor Yellow
Write-Host ""
Write-Host "Attendez 2-5 minutes pour la propagation DNS, puis relancez ce script." -ForegroundColor Cyan
Write-Host ""
