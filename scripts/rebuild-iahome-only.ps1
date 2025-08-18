Write-Host "Reconstruction de l'application IAHome uniquement..." -ForegroundColor Green

try {
    # Arreter uniquement l'application iahome
    Write-Host "`nArret de l'application IAHome..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml stop iahome-app
    
    # Reconstruire l'image
    Write-Host "`nReconstruction de l'image Docker..." -ForegroundColor Yellow
    docker build -t iahome:latest .
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Image reconstruite avec succes!" -ForegroundColor Green
        
        # Redemarrer uniquement l'application
        Write-Host "`nRedemarrage de l'application IAHome..." -ForegroundColor Yellow
        docker-compose -f docker-compose.prod.yml up -d iahome-app
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "Application redemarree avec succes!" -ForegroundColor Green
            
            # Attendre que l'application soit prete
            Write-Host "`nAttente du demarrage de l'application..." -ForegroundColor Yellow
            Start-Sleep -Seconds 15
            
            # Tester l'acces a l'application
            Write-Host "`nTest d'acces a l'application..." -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 30
                if ($response.StatusCode -eq 200) {
                    Write-Host "✅ Application accessible!" -ForegroundColor Green
                } else {
                    Write-Host "⚠️ Application accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "❌ Impossible de tester l'application: $($_.Exception.Message)" -ForegroundColor Red
            }
            
            Write-Host "`nServices externes non affectes:" -ForegroundColor Cyan
            Write-Host "  • Stirling-PDF: http://localhost:8081" -ForegroundColor White
            Write-Host "  • MeTube: http://localhost:8082" -ForegroundColor White
            Write-Host "  • LibreSpeed: http://localhost:8083" -ForegroundColor White
            Write-Host "  • PSITransfer: http://localhost:8084" -ForegroundColor White
            Write-Host "  • Portainer: http://localhost:8085" -ForegroundColor White
            
        } else {
            Write-Host "Erreur lors du redemarrage de l'application" -ForegroundColor Red
        }
    } else {
        Write-Host "Erreur lors de la reconstruction de l'image" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nReconstruction terminee!" -ForegroundColor Green
