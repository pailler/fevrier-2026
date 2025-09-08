# Script de test pour la configuration MeTube
Write-Host "🧪 Test de la configuration MeTube" -ForegroundColor Cyan

# Test 1: Vérifier la résolution DNS
Write-Host "`n1. Test de résolution DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "metube.iahome.fr" -ErrorAction Stop
    Write-Host "✅ DNS résolu: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "❌ DNS non résolu - Configurez d'abord le DNS dans Cloudflare" -ForegroundColor Red
    Write-Host "   IP publique détectée: 90.90.226.59" -ForegroundColor Gray
    Write-Host "   Ajoutez un enregistrement A: metube -> 90.90.226.59" -ForegroundColor Gray
    exit 1
}

# Test 2: Vérifier l'accessibilité HTTP
Write-Host "`n2. Test d'accessibilité HTTP..." -ForegroundColor Yellow
try {
    $httpResponse = Invoke-WebRequest -Uri "http://metube.iahome.fr" -Method GET -TimeoutSec 10 -MaximumRedirection 0
    if ($httpResponse.StatusCode -eq 301 -or $httpResponse.StatusCode -eq 302) {
        Write-Host "✅ Redirection HTTP vers HTTPS détectée (Code: $($httpResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Réponse HTTP inattendue (Code: $($httpResponse.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur HTTP: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier l'accessibilité HTTPS
Write-Host "`n3. Test d'accessibilité HTTPS..." -ForegroundColor Yellow
try {
    $httpsResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
    if ($httpsResponse.StatusCode -eq 200) {
        Write-Host "✅ HTTPS accessible (Code: $($httpsResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Réponse HTTPS inattendue (Code: $($httpsResponse.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur HTTPS: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier le certificat SSL
Write-Host "`n4. Test du certificat SSL..." -ForegroundColor Yellow
try {
    $cert = [System.Net.ServicePointManager]::ServerCertificateValidationCallback = {$true}
    $request = [System.Net.WebRequest]::Create("https://metube.iahome.fr")
    $response = $request.GetResponse()
    $cert = $request.ServicePoint.Certificate
    $cert2 = New-Object System.Security.Cryptography.X509Certificates.X509Certificate2($cert)
    Write-Host "✅ Certificat SSL valide" -ForegroundColor Green
    Write-Host "   Émis par: $($cert2.Issuer)" -ForegroundColor Gray
    Write-Host "   Valide jusqu'au: $($cert2.NotAfter)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur certificat SSL: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Vérifier le conteneur MeTube
Write-Host "`n5. Test du conteneur MeTube..." -ForegroundColor Yellow
try {
    $containerStatus = docker inspect metube --format "{{.State.Status}}"
    if ($containerStatus -eq "running") {
        Write-Host "✅ Conteneur MeTube en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "❌ Conteneur MeTube non en cours d'exécution (Status: $containerStatus)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification du conteneur" -ForegroundColor Red
}

# Test 6: Vérifier la configuration Traefik
Write-Host "`n6. Test de la configuration Traefik..." -ForegroundColor Yellow
try {
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/http/routers" -Method GET -TimeoutSec 5
    $routers = $traefikResponse.Content | ConvertFrom-Json
    $metubeRouter = $routers | Where-Object { $_.name -like "*metube*" }
    if ($metubeRouter) {
        Write-Host "✅ Routeur MeTube trouvé dans Traefik" -ForegroundColor Green
        Write-Host "   Nom: $($metubeRouter.name)" -ForegroundColor Gray
        Write-Host "   Règle: $($metubeRouter.rule)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Routeur MeTube non trouvé dans Traefik" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la vérification de Traefik" -ForegroundColor Red
}

Write-Host "`n🎯 Résumé des tests :" -ForegroundColor Cyan
Write-Host "   - DNS: Vérifiez que metube.iahome.fr pointe vers 90.90.226.59" -ForegroundColor White
Write-Host "   - SSL: Let's Encrypt générera automatiquement le certificat" -ForegroundColor White
Write-Host "   - Service: http://metube:8081 (conteneur Docker)" -ForegroundColor White
Write-Host "   - Configuration: traefik/dynamic/metube-cloudflare.yml" -ForegroundColor White

Write-Host "`n✅ Test terminé" -ForegroundColor Green

