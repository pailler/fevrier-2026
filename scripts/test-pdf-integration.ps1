Write-Host "Test de l'integration du module PDF..." -ForegroundColor Green

try {
    # Tester l'acces a la page d'accueil
    Write-Host "`nTest d'acces a la page d'accueil..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Page d'accueil accessible!" -ForegroundColor Green
        
        # Analyser le contenu HTML pour verifier le module PDF
        $htmlContent = $response.Content
        
        # Verifier la presence du module PDF
        $hasPdfModule = $htmlContent -match "pdf" -or $htmlContent -match "PDF"
        $hasPdfImage = $htmlContent -match "pdf-plus.jpg"
        $hasPdfLink = $htmlContent -match "/card/"
        
        Write-Host "`nVerification du module PDF:" -ForegroundColor Cyan
        
        if ($hasPdfModule) {
            Write-Host "  ✅ Module PDF detecte dans le contenu" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Module PDF non detecte dans le contenu" -ForegroundColor Red
        }
        
        if ($hasPdfImage) {
            Write-Host "  ✅ Image PDF (pdf-plus.jpg) detectee" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Image PDF non detectee" -ForegroundColor Red
        }
        
        if ($hasPdfLink) {
            Write-Host "  ✅ Liens vers les cartes de modules detectes" -ForegroundColor Green
        } else {
            Write-Host "  ❌ Liens vers les cartes de modules non detectes" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Page d'accueil accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
    
    # Tester l'acces au service PDF
    Write-Host "`nTest d'acces au service PDF..." -ForegroundColor Yellow
    try {
        $pdfResponse = Invoke-WebRequest -Uri "https://pdf.regispailler.fr" -UseBasicParsing -TimeoutSec 10
        if ($pdfResponse.StatusCode -eq 200) {
            Write-Host "  ✅ Service PDF accessible sur https://pdf.regispailler.fr" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Service PDF accessible mais statut: $($pdfResponse.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Service PDF non accessible: $($_.Exception.Message)" -ForegroundColor Red
    }
    
    # Tester l'acces local au service PDF
    Write-Host "`nTest d'acces local au service PDF..." -ForegroundColor Yellow
    try {
        $localPdfResponse = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 10
        if ($localPdfResponse.StatusCode -eq 200) {
            Write-Host "  ✅ Service PDF accessible localement sur http://localhost:8081" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Service PDF accessible localement mais statut: $($localPdfResponse.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Service PDF non accessible localement: $($_.Exception.Message)" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nInstructions de test manuel:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr" -ForegroundColor White
Write-Host "2. Verifiez que le module PDF est present sur la page d'accueil" -ForegroundColor White
Write-Host "3. Cliquez sur le module PDF pour acceder a la page de details" -ForegroundColor White
Write-Host "4. Sur la page de details, cliquez sur 'Acceder au module'" -ForegroundColor White
Write-Host "5. Verifiez que l'iframe s'ouvre avec https://pdf.regispailler.fr" -ForegroundColor White

Write-Host "`nURLs de test:" -ForegroundColor Yellow
Write-Host "  • Page d'accueil: https://iahome.fr" -ForegroundColor White
Write-Host "  • Service PDF: https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "  • Service PDF local: http://localhost:8081" -ForegroundColor White

Write-Host "`nTest termine!" -ForegroundColor Green
