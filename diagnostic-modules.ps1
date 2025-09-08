# Diagnostic complet des modules
Write-Host "Diagnostic complet des modules" -ForegroundColor Cyan

Write-Host "`n1. Test des reponses HTTP :" -ForegroundColor Yellow

# Test MeTube
Write-Host "`nMeTube :" -ForegroundColor Cyan
try {
    $metubeResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "Status Code: $($metubeResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($metubeResponse.Content.Length)" -ForegroundColor Gray
    Write-Host "Content Type: $($metubeResponse.Headers.'Content-Type')" -ForegroundColor Gray
    Write-Host "Server: $($metubeResponse.Headers.Server)" -ForegroundColor Gray
    
    # Vérifier si le contenu contient des erreurs
    if ($metubeResponse.Content -match "error|exception|failed|timeout") {
        Write-Host "ERREUR DETECTEE dans le contenu" -ForegroundColor Red
    } else {
        Write-Host "Contenu semble correct" -ForegroundColor Green
    }
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test PDF
Write-Host "`nPDF :" -ForegroundColor Cyan
try {
    $pdfResponse = Invoke-WebRequest -Uri "https://pdf.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "Status Code: $($pdfResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($pdfResponse.Content.Length)" -ForegroundColor Gray
    Write-Host "Content Type: $($pdfResponse.Headers.'Content-Type')" -ForegroundColor Gray
    Write-Host "Server: $($pdfResponse.Headers.Server)" -ForegroundColor Gray
    
    if ($pdfResponse.Content -match "error|exception|failed|timeout") {
        Write-Host "ERREUR DETECTEE dans le contenu" -ForegroundColor Red
    } else {
        Write-Host "Contenu semble correct" -ForegroundColor Green
    }
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

# Test QR Codes
Write-Host "`nQR Codes :" -ForegroundColor Cyan
try {
    $qrcodesResponse = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    Write-Host "Status Code: $($qrcodesResponse.StatusCode)" -ForegroundColor Green
    Write-Host "Content Length: $($qrcodesResponse.Content.Length)" -ForegroundColor Gray
    Write-Host "Content Type: $($qrcodesResponse.Headers.'Content-Type')" -ForegroundColor Gray
    Write-Host "Server: $($qrcodesResponse.Headers.Server)" -ForegroundColor Gray
    
    if ($qrcodesResponse.Content -match "error|exception|failed|timeout") {
        Write-Host "ERREUR DETECTEE dans le contenu" -ForegroundColor Red
    } else {
        Write-Host "Contenu semble correct" -ForegroundColor Green
    }
} catch {
    Write-Host "ERREUR: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Verification des conteneurs :" -ForegroundColor Yellow

# Vérifier les conteneurs
Write-Host "`nConteneurs actifs :" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | findstr -i "metube\|stirling\|qr-code"

Write-Host "`n3. Verification des reseaux :" -ForegroundColor Yellow

# Vérifier les réseaux
Write-Host "`nReseaux Docker :" -ForegroundColor Cyan
docker network ls | findstr -i "services\|iahome"

Write-Host "`n4. Test de connectivite interne :" -ForegroundColor Yellow

# Test de connectivité interne
Write-Host "`nTest de connectivite interne :" -ForegroundColor Cyan
Write-Host "Test MeTube interne :" -ForegroundColor Gray
docker exec iahome-traefik wget -q --spider http://metube:8081 && Write-Host "OK" -ForegroundColor Green || Write-Host "ERREUR" -ForegroundColor Red

Write-Host "Test PDF interne :" -ForegroundColor Gray
docker exec iahome-traefik wget -q --spider http://stirling-pdf:8080 && Write-Host "OK" -ForegroundColor Green || Write-Host "ERREUR" -ForegroundColor Red

Write-Host "Test QR Codes interne :" -ForegroundColor Gray
docker exec iahome-traefik wget -q --spider http://qr-code-service:8080 && Write-Host "OK" -ForegroundColor Green || Write-Host "ERREUR" -ForegroundColor Red

Write-Host "`n5. Logs Traefik recents :" -ForegroundColor Yellow
Write-Host "Dernieres lignes des logs Traefik :" -ForegroundColor Cyan
docker logs iahome-traefik --tail 10

