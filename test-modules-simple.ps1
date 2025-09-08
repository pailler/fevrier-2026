# Test des modules apres correction avec le modele LibreSpeed
Write-Host "Test des modules apres correction avec le modele LibreSpeed" -ForegroundColor Cyan

Write-Host "`nCorrections appliquees :" -ForegroundColor Yellow
Write-Host "MeTube : http://metube:8081 (nom du conteneur)" -ForegroundColor Green
Write-Host "PDF : http://stirling-pdf:8080 (nom du conteneur)" -ForegroundColor Green
Write-Host "QR Codes : http://qr-code-service:8080 (nom du conteneur)" -ForegroundColor Green
Write-Host "QR Codes ajoute au reseau services-network" -ForegroundColor Green
Write-Host "Traefik redemarre" -ForegroundColor Green

Write-Host "`nTest des modules :" -ForegroundColor Yellow

# Test LibreSpeed (reference qui fonctionne)
Write-Host "`n1. Test LibreSpeed (reference) :" -ForegroundColor Cyan
try {
    $librespeedResponse = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($librespeedResponse.StatusCode -eq 200) {
        Write-Host "LibreSpeed : OK ($($librespeedResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "LibreSpeed : Erreur $($librespeedResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "LibreSpeed : $($_.Exception.Message)" -ForegroundColor Red
}

# Test MeTube
Write-Host "`n2. Test MeTube :" -ForegroundColor Cyan
try {
    $metubeResponse = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($metubeResponse.StatusCode -eq 200) {
        Write-Host "MeTube : OK ($($metubeResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "MeTube : Erreur $($metubeResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "MeTube : $($_.Exception.Message)" -ForegroundColor Red
}

# Test PDF
Write-Host "`n3. Test PDF :" -ForegroundColor Cyan
try {
    $pdfResponse = Invoke-WebRequest -Uri "https://pdf.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($pdfResponse.StatusCode -eq 200) {
        Write-Host "PDF : OK ($($pdfResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "PDF : Erreur $($pdfResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "PDF : $($_.Exception.Message)" -ForegroundColor Red
}

# Test PsiTransfer
Write-Host "`n4. Test PsiTransfer :" -ForegroundColor Cyan
try {
    $psitransferResponse = Invoke-WebRequest -Uri "https://psitransfer.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($psitransferResponse.StatusCode -eq 200) {
        Write-Host "PsiTransfer : OK ($($psitransferResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "PsiTransfer : Erreur $($psitransferResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "PsiTransfer : $($_.Exception.Message)" -ForegroundColor Red
}

# Test QR Codes
Write-Host "`n5. Test QR Codes :" -ForegroundColor Cyan
try {
    $qrcodesResponse = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr" -Method GET -TimeoutSec 10 -UseBasicParsing
    if ($qrcodesResponse.StatusCode -eq 200) {
        Write-Host "QR Codes : OK ($($qrcodesResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "QR Codes : Erreur $($qrcodesResponse.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "QR Codes : $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nResume des configurations :" -ForegroundColor Yellow
Write-Host "LibreSpeed : http://librespeed:80 (reference qui fonctionne)" -ForegroundColor Gray
Write-Host "MeTube : http://metube:8081 (corrige)" -ForegroundColor Gray
Write-Host "PDF : http://stirling-pdf:8080 (corrige)" -ForegroundColor Gray
Write-Host "PsiTransfer : http://psitransfer:3000 (deja correct)" -ForegroundColor Gray
Write-Host "QR Codes : http://qr-code-service:8080 (corrige)" -ForegroundColor Gray

Write-Host "`nTous les modules utilisent maintenant le meme modele que LibreSpeed :" -ForegroundColor Yellow
Write-Host "- Noms de conteneurs au lieu d'IPs directes" -ForegroundColor Gray
Write-Host "- Reseau services-network" -ForegroundColor Gray
Write-Host "- Configuration Cloudflare SSL" -ForegroundColor Gray
Write-Host "- Middlewares security-headers et compress" -ForegroundColor Gray

Write-Host "`nSi des modules ne fonctionnent toujours pas :" -ForegroundColor Yellow
Write-Host "1. Verifiez que le DNS est configure dans Cloudflare" -ForegroundColor White
Write-Host "2. Attendez la propagation DNS (5-15 minutes)" -ForegroundColor White
Write-Host "3. Verifiez les logs Traefik : docker logs iahome-traefik" -ForegroundColor White
Write-Host "4. Verifiez que les conteneurs sont sur le bon reseau" -ForegroundColor White

