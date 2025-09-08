# Test de la configuration PDF
Write-Host "Test de la configuration PDF" -ForegroundColor Cyan

Write-Host "`nConfiguration appliquée :" -ForegroundColor Yellow
Write-Host "✅ Reverse proxy : pdf.iahome.fr -> stirling-pdf:8080" -ForegroundColor Green
Write-Host "✅ SSL : Cloudflare (même approche que LibreSpeed/MeTube)" -ForegroundColor Green
Write-Host "✅ Middlewares : security-headers, compress" -ForegroundColor Green

Write-Host "`nTest de connectivité locale :" -ForegroundColor Yellow
try {
    $pdfResponse = Invoke-WebRequest -Uri "http://localhost:8081" -Method GET -TimeoutSec 10
    if ($pdfResponse.StatusCode -eq 200) {
        Write-Host "✅ PDF accessible localement sur port 8081" -ForegroundColor Green
    } else {
        Write-Host "❌ PDF non accessible localement (Code: $($pdfResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur PDF local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de Traefik avec Host header :" -ForegroundColor Yellow
try {
    $headers = @{
        'Host' = 'pdf.iahome.fr'
    }
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost" -Method GET -Headers $headers -TimeoutSec 10
    if ($traefikResponse.StatusCode -eq 200) {
        Write-Host "✅ Traefik route PDF configurée correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ Traefik route PDF non configurée (Code: $($traefikResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik PDF: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest DNS (simulation) :" -ForegroundColor Yellow
Write-Host "⚠️  Pour que pdf.iahome.fr fonctionne, vous devez :" -ForegroundColor Yellow
Write-Host "1. Aller sur Cloudflare DNS" -ForegroundColor White
Write-Host "2. Ajouter un enregistrement A : pdf.iahome.fr -> VOTRE_IP_PUBLIQUE" -ForegroundColor White
Write-Host "3. Activer le proxy (nuage orange)" -ForegroundColor White

Write-Host "`nVérification des conteneurs :" -ForegroundColor Yellow
try {
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    Write-Host $containers
} catch {
    Write-Host "❌ Erreur lors de la vérification des conteneurs" -ForegroundColor Red
}

Write-Host "`n✅ Configuration PDF terminée !" -ForegroundColor Green
Write-Host "   Prochaine étape : Configurer le DNS Cloudflare" -ForegroundColor Gray

