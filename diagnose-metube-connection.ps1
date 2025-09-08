# Script de diagnostic pour MeTube
Write-Host "🔍 Diagnostic de la connexion MeTube" -ForegroundColor Cyan

Write-Host "`n📋 Problème identifié :" -ForegroundColor Red
Write-Host "   Let's Encrypt ne peut pas obtenir le certificat SSL" -ForegroundColor Gray
Write-Host "   Erreur: DNS problem: NXDOMAIN looking up A for metube.iahome.fr" -ForegroundColor Gray
Write-Host "   Cause: Le domaine metube.iahome.fr n'existe pas dans le DNS" -ForegroundColor Gray

Write-Host "`n1. 🌐 Vérification de la résolution DNS..." -ForegroundColor Yellow
try {
    $dnsResult = Resolve-DnsName "metube.iahome.fr" -ErrorAction Stop
    Write-Host "✅ DNS résolu: $($dnsResult.IPAddress)" -ForegroundColor Green
} catch {
    Write-Host "❌ DNS NON RÉSOLU - C'est le problème principal !" -ForegroundColor Red
    Write-Host "   Le domaine metube.iahome.fr n'existe pas dans le DNS" -ForegroundColor Gray
}

Write-Host "`n2. 🔧 Vérification de l'IP publique..." -ForegroundColor Yellow
try {
    $publicIP = Invoke-RestMethod -Uri "https://api.ipify.org" -TimeoutSec 10
    Write-Host "✅ Votre IP publique: $publicIP" -ForegroundColor Green
} catch {
    Write-Host "❌ Impossible de récupérer l'IP publique" -ForegroundColor Red
}

Write-Host "`n3. 🐳 Vérification du conteneur MeTube..." -ForegroundColor Yellow
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

Write-Host "`n4. 🔗 Test de connectivité locale..." -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:8082" -Method GET -TimeoutSec 5
    if ($localResponse.StatusCode -eq 200) {
        Write-Host "✅ MeTube accessible localement sur le port 8082" -ForegroundColor Green
    } else {
        Write-Host "❌ MeTube non accessible localement (Code: $($localResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur de connexion locale: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n5. 🛠️ Vérification de la configuration Traefik..." -ForegroundColor Yellow
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

Write-Host "`n📋 SOLUTION REQUISE :" -ForegroundColor Yellow
Write-Host "`n1. 🌐 Configurez le DNS dans Cloudflare :" -ForegroundColor White
Write-Host "   - Connectez-vous à https://dash.cloudflare.com" -ForegroundColor Gray
Write-Host "   - Sélectionnez le domaine 'iahome.fr'" -ForegroundColor Gray
Write-Host "   - Allez dans l'onglet 'DNS'" -ForegroundColor Gray
Write-Host "   - Cliquez sur 'Add record'" -ForegroundColor Gray
Write-Host "   - Type: A" -ForegroundColor Gray
Write-Host "   - Name: metube" -ForegroundColor Gray
Write-Host "   - IPv4 address: $publicIP" -ForegroundColor Gray
Write-Host "   - Proxy status: ✅ (orange cloud activé)" -ForegroundColor Gray
Write-Host "   - TTL: Auto" -ForegroundColor Gray

Write-Host "`n2. ⏳ Attendez la propagation DNS (2-5 minutes)" -ForegroundColor White

Write-Host "`n3. 🧪 Testez la configuration :" -ForegroundColor White
Write-Host "   powershell -ExecutionPolicy Bypass -File test-metube-config.ps1" -ForegroundColor Gray

Write-Host "`n4. 🌐 Accédez à MeTube :" -ForegroundColor White
Write-Host "   https://metube.iahome.fr" -ForegroundColor Gray

Write-Host "`n⚠️  IMPORTANT :" -ForegroundColor Red
Write-Host "   Sans configuration DNS, Let's Encrypt ne peut pas générer le certificat SSL" -ForegroundColor Gray
Write-Host "   et l'accès à metube.iahome.fr ne fonctionnera pas." -ForegroundColor Gray

Write-Host "`n✅ Diagnostic terminé" -ForegroundColor Green

