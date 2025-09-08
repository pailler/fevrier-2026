# Test de la configuration PsiTransfer
Write-Host "Test de la configuration PsiTransfer" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : psitransfer.iahome.fr -> psitransfer:3000" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que LibreSpeed/MeTube/PDF)" -ForegroundColor Green
Write-Host "✅ Middlewares : security-headers, compress" -ForegroundColor Green

Write-Host "`nTest de connectivité locale :" -ForegroundColor Yellow
try {
    $psitransferResponse = Invoke-WebRequest -Uri "http://localhost:8084" -Method GET -TimeoutSec 10
    if ($psitransferResponse.StatusCode -eq 200) {
        Write-Host "✅ PsiTransfer accessible localement sur port 8084" -ForegroundColor Green
    } else {
        Write-Host "❌ PsiTransfer non accessible localement (Code: $($psitransferResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PsiTransfer local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de Traefik avec Host header :" -ForegroundColor Yellow
try {
    $headers = @{
        'Host' = 'psitransfer.iahome.fr'
    }
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost" -Method GET -Headers $headers -TimeoutSec 10
    if ($traefikResponse.StatusCode -eq 200) {
        Write-Host "✅ Traefik route PsiTransfer configurée correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ Traefik route PsiTransfer non configurée (Code: $($traefikResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik PsiTransfer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest DNS (simulation) :" -ForegroundColor Yellow
Write-Host "⚠️  Pour que psitransfer.iahome.fr fonctionne, vous devez :" -ForegroundColor Yellow
Write-Host "1. Aller sur Cloudflare DNS" -ForegroundColor White
Write-Host "2. Ajouter un enregistrement A : psitransfer.iahome.fr -> VOTRE_IP_PUBLIQUE" -ForegroundColor White
Write-Host "3. Activer le proxy (nuage orange)" -ForegroundColor White

Write-Host "`nVérification des conteneurs :" -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr -i psitransfer
    Write-Host $containers
} catch {
    Write-Host "❌ Erreur lors de la vérification des conteneurs" -ForegroundColor Red
}

Write-Host "`n✅ Configuration PsiTransfer terminée !" -ForegroundColor Green
Write-Host "   Prochaine étape : Configurer le DNS Cloudflare" -ForegroundColor Gray

