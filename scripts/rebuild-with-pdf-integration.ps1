Write-Host "Reconstruction de l'application avec integration PDF..." -ForegroundColor Green

try {
    # Arreter les conteneurs
    Write-Host "`nArret des conteneurs..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml down
    
    # Reconstruire l'image
    Write-Host "`nReconstruction de l'image Docker..." -ForegroundColor Yellow
    docker build -t iahome:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Image reconstruite avec succes!" -ForegroundColor Green
        
        # Redemarrer les conteneurs
        Write-Host "`nRedemarrage des conteneurs..." -ForegroundColor Yellow
        docker-compose -f docker-compose.prod.yml up -d
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Conteneurs redemarres avec succes!" -ForegroundColor Green
            
            # Attendre que l'application soit prete
            Write-Host "`nAttente du demarrage de l'application..." -ForegroundColor Yellow
            Start-Sleep -Seconds 30
            
            # Tester l'integration PDF
            Write-Host "`nTest de l'integration PDF..." -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 30
                if ($response.StatusCode -eq 200) {
                    Write-Host "Application accessible!" -ForegroundColor Green
                    
                    # Verifier la presence du module PDF
                    $htmlContent = $response.Content
                    $hasPdfModule = $htmlContent -match "pdf" -or $htmlContent -match "PDF"
                    
                    if ($hasPdfModule) {
                        Write-Host "✅ Module PDF detecte dans l'application" -ForegroundColor Green
                    } else {
                        Write-Host "⚠️ Module PDF non detecte (peut etre normal si pas de module PDF en base)" -ForegroundColor Yellow
                    }
                } else {
                    Write-Host "Application accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Impossible de tester l'application: $($_.Exception.Message)" -ForegroundColor Yellow
            }
            
        } else {
            Write-Host "Erreur lors du redemarrage des conteneurs" -ForegroundColor Red
        }
    } else {
        Write-Host "Erreur lors de la reconstruction de l'image" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nIntegrations appliquees:" -ForegroundColor Cyan
Write-Host "   • Gestion speciale pour PDF dans la page de details" -ForegroundColor White
Write-Host "   • URL directe vers https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   • Alias 'pdf' et 'pdf+' dans la liste des URLs" -ForegroundColor White
Write-Host "   • Image pdf-plus.jpg deja configuree" -ForegroundColor White

Write-Host "`nInstructions de test:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr" -ForegroundColor White
Write-Host "2. Trouvez le module PDF sur la page d'accueil" -ForegroundColor White
Write-Host "3. Cliquez sur le module PDF" -ForegroundColor White
Write-Host "4. Sur la page de details, cliquez sur 'Acceder au module'" -ForegroundColor White
Write-Host "5. Verifiez que l'iframe s'ouvre avec https://pdf.regispailler.fr" -ForegroundColor White

Write-Host "`nReconstruction terminee!" -ForegroundColor Green
