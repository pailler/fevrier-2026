# Script de vérification du statut Cloudflare et de l'impact sur vos services

Write-Host "🔍 Vérification du statut Cloudflare..." -ForegroundColor Cyan
Write-Host ""

# 1. Statut global Cloudflare
Write-Host "1️⃣ Statut global Cloudflare..." -ForegroundColor Yellow
try {
    $statusResponse = Invoke-RestMethod -Uri "https://www.cloudflarestatus.com/api/v2/status.json" -UseBasicParsing
    $status = $statusResponse.status
    Write-Host "   Status: $($status.description)" -ForegroundColor $(if ($status.indicator -eq "none") { "Green" } else { "Yellow" })
    Write-Host "   Indicator: $($status.indicator)" -ForegroundColor $(if ($status.indicator -eq "none") { "Green" } else { "Yellow" })
} catch {
    Write-Host "   ⚠️ Impossible de récupérer le statut" -ForegroundColor Yellow
}

# 2. Test résolution DNS avec 1.1.1.1
Write-Host "`n2️⃣ Test résolution DNS avec 1.1.1.1..." -ForegroundColor Yellow
$testDomains = @("iahome.fr", "cloudflare.com", "google.com")
foreach ($domain in $testDomains) {
    try {
        $result = Resolve-DnsName -Name $domain -Type A -Server "1.1.1.1" -ErrorAction Stop
        Write-Host "   ✅ $domain : $($result[0].IPAddress)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $domain : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Test résolution DNS avec 8.8.8.8 (backup)
Write-Host "`n3️⃣ Test résolution DNS avec 8.8.8.8 (Google - Backup)..." -ForegroundColor Yellow
foreach ($domain in $testDomains) {
    try {
        $result = Resolve-DnsName -Name $domain -Type A -Server "8.8.8.8" -ErrorAction Stop
        Write-Host "   ✅ $domain : $($result[0].IPAddress)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ $domain : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. DNS configurés sur votre système
Write-Host "`n4️⃣ DNS configurés sur votre système..." -ForegroundColor Yellow
try {
    $dnsConfig = Get-DnsClientServerAddress -AddressFamily IPv4 | Where-Object { $_.ServerAddresses.Count -gt 0 } | Select-Object -First 1
    if ($dnsConfig) {
        Write-Host "   Interface: $($dnsConfig.InterfaceAlias)" -ForegroundColor Gray
        $dnsConfig.ServerAddresses | ForEach-Object {
            $isCloudflare = $_ -eq "1.1.1.1" -or $_ -eq "1.0.0.1"
            $color = if ($isCloudflare) { "Cyan" } else { "Gray" }
            Write-Host "   DNS: $_" -ForegroundColor $color
        }
    } else {
        Write-Host "   ⚠️ Aucune configuration DNS trouvée" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Impossible de récupérer la configuration DNS" -ForegroundColor Yellow
}

# 5. Test de vos services
Write-Host "`n5️⃣ Test de vos services IAHome..." -ForegroundColor Yellow
$yourServices = @(
    "https://iahome.fr",
    "https://qrcodes.iahome.fr",
    "https://librespeed.iahome.fr"
)

foreach ($service in $yourServices) {
    try {
        $response = Invoke-WebRequest -Uri $service -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        Write-Host "   ✅ $service : $($response.StatusCode)" -ForegroundColor Green
    } catch {
        $statusCode = "N/A"
        if ($_.Exception.Response) {
            $statusCode = [int]$_.Exception.Response.StatusCode.value__
        }
        $color = if ($statusCode -eq 502 -or $statusCode -eq 503) { "Yellow" } else { "Red" }
        Write-Host "   ⚠️ $service : Erreur $statusCode" -ForegroundColor $color
    }
}

# 6. Statut du tunnel Cloudflare
Write-Host "`n6️⃣ Statut du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    $tunnelInfo = & .\cloudflared.exe tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID" -or $tunnelInfo -match "connection") {
        Write-Host "   ✅ Tunnel actif avec connexions" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Tunnel non actif" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Impossible de vérifier le tunnel" -ForegroundColor Yellow
}

# 7. Résumé
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   • Le résolveur 1.1.1.1 est utilisé pour la résolution DNS locale" -ForegroundColor Gray
Write-Host "   • Vos tunnels Cloudflare ne dépendent PAS de 1.1.1.1" -ForegroundColor Gray
Write-Host "   • Vos domaines Cloudflare utilisent les serveurs DNS Cloudflare" -ForegroundColor Gray
Write-Host "   • Impact sur vos services : MINIMAL (uniquement si vous utilisez 1.1.1.1 comme DNS par défaut)" -ForegroundColor Green

Write-Host "`n💡 Recommandation:" -ForegroundColor Cyan
Write-Host "   Configurez des DNS multiples pour plus de résilience:" -ForegroundColor Gray
Write-Host "   1.1.1.1 (Cloudflare), 8.8.8.8 (Google), 9.9.9.9 (Quad9)" -ForegroundColor Gray

Write-Host "`n✅ Vérification terminée!" -ForegroundColor Green


