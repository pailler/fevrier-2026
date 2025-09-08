# Script d'attente de la propagation DNS pour MeTube
Write-Host "Attente de la propagation DNS pour metube.iahome.fr" -ForegroundColor Cyan

$maxAttempts = 20
$attempt = 0
$dnsResolved = $false

Write-Host "`nVerification de la resolution DNS..." -ForegroundColor Yellow
Write-Host "IP publique cible: 90.90.226.59" -ForegroundColor Gray

while (-not $dnsResolved -and $attempt -lt $maxAttempts) {
    $attempt++
    Write-Host "`nTentative $attempt/$maxAttempts..." -ForegroundColor White
    
    try {
        $dnsResult = Resolve-DnsName "metube.iahome.fr" -ErrorAction Stop
        if ($dnsResult.IPAddress -eq "90.90.226.59") {
            Write-Host "DNS resolu correctement: $($dnsResult.IPAddress)" -ForegroundColor Green
            $dnsResolved = $true
        } else {
            Write-Host "DNS resolu mais IP incorrecte: $($dnsResult.IPAddress) (attendu: 90.90.226.59)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "DNS non resolu encore..." -ForegroundColor Red
    }
    
    if (-not $dnsResolved) {
        Write-Host "Attente de 30 secondes avant la prochaine tentative..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
    }
}

if ($dnsResolved) {
    Write-Host "`nDNS propage avec succes !" -ForegroundColor Green
    Write-Host "`nTest de la configuration MeTube..." -ForegroundColor Yellow
    
    # Test HTTP
    try {
        $httpResponse = Invoke-WebRequest -Uri "http://metube.iahome.fr" -Method GET -TimeoutSec 10 -MaximumRedirection 0
        if ($httpResponse.StatusCode -eq 301 -or $httpResponse.StatusCode -eq 302) {
            Write-Host "Redirection HTTP vers HTTPS detectee (Code: $($httpResponse.StatusCode))" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erreur HTTP: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Test HTTPS
    try {
        $httpsResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
        if ($httpsResponse.StatusCode -eq 200) {
            Write-Host "HTTPS accessible (Code: $($httpsResponse.StatusCode))" -ForegroundColor Green
            Write-Host "`nMeTube est maintenant accessible sur: https://metube.iahome.fr" -ForegroundColor Green
        }
    } catch {
        Write-Host "Erreur HTTPS: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Let's Encrypt va generer le certificat automatiquement..." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "`nTimeout atteint. Le DNS n'est pas encore propage." -ForegroundColor Red
    Write-Host "Verifiez la configuration DNS dans Cloudflare:" -ForegroundColor Yellow
    Write-Host "- Type: A" -ForegroundColor Gray
    Write-Host "- Name: metube" -ForegroundColor Gray
    Write-Host "- IPv4: 90.90.226.59" -ForegroundColor Gray
    Write-Host "- Proxy: Active (orange cloud)" -ForegroundColor Gray
}

Write-Host "`nTest termine" -ForegroundColor Cyan

