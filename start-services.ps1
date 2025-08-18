Write-Host "Demarrage des services Docker externes..." -ForegroundColor Green

try {
    # Creer les dossiers necessaires
    Write-Host "`nCreation des dossiers necessaires..." -ForegroundColor Yellow
    $folders = @("pdf-data", "pdf-uploads", "pdf-temp", "metube-downloads", "psitransfer-data", "portainer-data")
    
    foreach ($folder in $folders) {
        if (!(Test-Path $folder)) {
            New-Item -ItemType Directory -Path $folder -Force
            Write-Host "  Dossier $folder cree" -ForegroundColor Green
        } else {
            Write-Host "  Dossier $folder existe deja" -ForegroundColor Cyan
        }
    }
    
    # Demarrer tous les services
    Write-Host "`nDemarrage des services..." -ForegroundColor Yellow
    docker-compose -f docker-compose.services.yml up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Services demarres avec succes!" -ForegroundColor Green
        
        # Attendre que les services soient prets
        Write-Host "`nAttente du demarrage des services..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Tester l'acces aux services
        Write-Host "`nTest d'acces aux services..." -ForegroundColor Yellow
        
        $services = @(
            @{Name="Stirling-PDF"; URL="http://localhost:8081"; Port="8081"},
            @{Name="MeTube"; URL="http://localhost:8082"; Port="8082"},
            @{Name="LibreSpeed"; URL="http://localhost:8083"; Port="8083"},
            @{Name="PSITransfer"; URL="http://localhost:8084"; Port="8084"},
            @{Name="Portainer"; URL="http://localhost:8085"; Port="8085"}
        )
        
        foreach ($service in $services) {
            try {
                $response = Invoke-WebRequest -Uri $service.URL -UseBasicParsing -TimeoutSec 10
                if ($response.StatusCode -eq 200) {
                    Write-Host "  ✅ $($service.Name) accessible sur port $($service.Port)" -ForegroundColor Green
                } else {
                    Write-Host "  ⚠️ $($service.Name) accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "  ❌ $($service.Name) non accessible: $($_.Exception.Message)" -ForegroundColor Red
            }
        }
        
        Write-Host "`nURLs d'acces:" -ForegroundColor Yellow
        Write-Host "  • Stirling-PDF: http://localhost:8081" -ForegroundColor White
        Write-Host "  • MeTube: http://localhost:8082" -ForegroundColor White
        Write-Host "  • LibreSpeed: http://localhost:8083" -ForegroundColor White
        Write-Host "  • PSITransfer: http://localhost:8084" -ForegroundColor White
        Write-Host "  • Portainer: http://localhost:8085" -ForegroundColor White
        
        Write-Host "`nURLs via Traefik (si configuré):" -ForegroundColor Yellow
        Write-Host "  • PDF: https://pdf.iahome.fr" -ForegroundColor White
        Write-Host "  • MeTube: https://metube.iahome.fr" -ForegroundColor White
        Write-Host "  • Speed Test: https://speed.iahome.fr" -ForegroundColor White
        Write-Host "  • Transfer: https://transfer.iahome.fr" -ForegroundColor White
        Write-Host "  • Portainer: https://portainer.iahome.fr" -ForegroundColor White
        
    } else {
        Write-Host "Erreur lors du demarrage des services" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDemarrage termine!" -ForegroundColor Green
