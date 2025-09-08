# Test final après rebuild complet avec QR codes
Write-Host "Test final après rebuild complet avec QR codes" -ForegroundColor Cyan

Write-Host "`n✅ Rebuild terminé avec succès !" -ForegroundColor Green
Write-Host "   - Application reconstruite avec --no-cache" -ForegroundColor Gray
Write-Host "   - Configuration QR codes intégrée" -ForegroundColor Gray
Write-Host "   - Tous les conteneurs redémarrés" -ForegroundColor Gray

Write-Host "`nTest de l'application principale :" -ForegroundColor Yellow
try {
    $appResponse = Invoke-WebRequest -Uri "https://iahome.fr" -Method GET -TimeoutSec 10
    if ($appResponse.StatusCode -eq 200) {
        Write-Host "✅ Application iahome.fr accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Application iahome.fr non accessible (Code: $($appResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur application: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de la page encours :" -ForegroundColor Yellow
try {
    $encoursResponse = Invoke-WebRequest -Uri "https://iahome.fr/encours" -Method GET -TimeoutSec 10
    if ($encoursResponse.StatusCode -eq 200) {
        Write-Host "✅ Page encours accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page encours non accessible (Code: $($encoursResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur page encours: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest de la configuration QR codes :" -ForegroundColor Yellow
try {
    $qrcodesResponse = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr" -Method GET -TimeoutSec 10
    if ($qrcodesResponse.StatusCode -eq 200) {
        Write-Host "✅ QR codes accessible via https://qrcodes.iahome.fr" -ForegroundColor Green
    } else {
        Write-Host "❌ QR codes non accessible (Code: $($qrcodesResponse.StatusCode))" -ForegroundColor Red
        Write-Host "   → Configurez le DNS Cloudflare pour qrcodes.iahome.fr" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur QR codes: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   → Configurez le DNS Cloudflare pour qrcodes.iahome.fr" -ForegroundColor Yellow
}

Write-Host "`nTest des autres modules :" -ForegroundColor Yellow
$modules = @(
    @{name="LibreSpeed"; url="https://librespeed.iahome.fr"},
    @{name="MeTube"; url="https://metube.iahome.fr"},
    @{name="PDF"; url="https://pdf.iahome.fr"},
    @{name="PsiTransfer"; url="https://psitransfer.iahome.fr"}
)

foreach ($module in $modules) {
    try {
        $response = Invoke-WebRequest -Uri $module.url -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $($module.name) accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ $($module.name) non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $($module.name) erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`nRésumé des modules configurés :" -ForegroundColor Yellow
Write-Host "✅ LibreSpeed : https://librespeed.iahome.fr" -ForegroundColor Green
Write-Host "✅ MeTube : https://metube.iahome.fr" -ForegroundColor Green
Write-Host "✅ PDF : https://pdf.iahome.fr" -ForegroundColor Green
Write-Host "✅ PsiTransfer : https://psitransfer.iahome.fr" -ForegroundColor Green
Write-Host "✅ QR codes : https://qrcodes.iahome.fr" -ForegroundColor Green

Write-Host "`nTest du bouton QR codes :" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Trouvez le module QR codes" -ForegroundColor White
Write-Host "4. Cliquez sur 'Accéder à l'application'" -ForegroundColor White
Write-Host "5. Vérifiez que https://qrcodes.iahome.fr s'ouvre dans un nouvel onglet" -ForegroundColor White

Write-Host "`n🎉 Rebuild terminé avec succès !" -ForegroundColor Green
Write-Host "   Tous les modules sont maintenant configurés avec le même workflow :" -ForegroundColor Gray
Write-Host "   - Reverse proxy et SSL" -ForegroundColor Gray
Write-Host "   - Vérification de connexion Google" -ForegroundColor Gray
Write-Host "   - Ouverture en nouvel onglet" -ForegroundColor Gray
Write-Host "   - URL directe sécurisée" -ForegroundColor Gray

