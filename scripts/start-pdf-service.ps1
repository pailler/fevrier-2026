Write-Host "Demarrage du service Stirling-PDF..." -ForegroundColor Green

try {
    # Creer les dossiers necessaires
    Write-Host "`nCreation des dossiers necessaires..." -ForegroundColor Yellow
    if (!(Test-Path "pdf-data")) {
        New-Item -ItemType Directory -Path "pdf-data" -Force
        Write-Host "  Dossier pdf-data cree" -ForegroundColor Green
    }
    if (!(Test-Path "pdf-uploads")) {
        New-Item -ItemType Directory -Path "pdf-uploads" -Force
        Write-Host "  Dossier pdf-uploads cree" -ForegroundColor Green
    }
    if (!(Test-Path "pdf-temp")) {
        New-Item -ItemType Directory -Path "pdf-temp" -Force
        Write-Host "  Dossier pdf-temp cree" -ForegroundColor Green
    }
    
    # Arreter le service s'il existe deja
    Write-Host "`nArret du service existant..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml stop stirling-pdf 2>$null
    docker-compose -f docker-compose.prod.yml rm -f stirling-pdf 2>$null
    
    # Demarrer le service
    Write-Host "`nDemarrage du service Stirling-PDF..." -ForegroundColor Yellow
    docker-compose -f docker-compose.prod.yml up -d stirling-pdf
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Service Stirling-PDF demarre avec succes!" -ForegroundColor Green
        
        # Attendre que le service soit prete
        Write-Host "`nAttente du demarrage complet..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30
        
        # Tester l'acces au service
        Write-Host "`nTest d'acces au service..." -ForegroundColor Yellow
        
        # Test local
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Service accessible localement sur http://localhost:8081" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ Service accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ❌ Service non accessible localement: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        # Test via Traefik (si le domaine est configure)
        try {
            $response = Invoke-WebRequest -Uri "https://pdf.iahome.fr" -UseBasicParsing -TimeoutSec 10
            if ($response.StatusCode -eq 200) {
                Write-Host "  ✅ Service accessible via https://pdf.iahome.fr" -ForegroundColor Green
            } else {
                Write-Host "  ⚠️ Service accessible via Traefik mais statut: $($response.StatusCode)" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "  ⚠️ Service non accessible via Traefik (normal si le domaine n'est pas configure): $($_.Exception.Message)" -ForegroundColor Yellow
        }
        
        # Afficher les logs du service
        Write-Host "`nLogs du service Stirling-PDF:" -ForegroundColor Cyan
        docker logs stirling-pdf --tail=10
        
        Write-Host "`nURLs d'acces:" -ForegroundColor Yellow
        Write-Host "  • Local: http://localhost:8081" -ForegroundColor White
        Write-Host "  • Via Traefik: https://pdf.iahome.fr" -ForegroundColor White
        
        Write-Host "`nFonctionnalites disponibles:" -ForegroundColor Yellow
        Write-Host "  • Conversion PDF vers divers formats" -ForegroundColor White
        Write-Host "  • Fusion de PDFs" -ForegroundColor White
        Write-Host "  • Extraction de texte (OCR)" -ForegroundColor White
        Write-Host "  • Compression de PDFs" -ForegroundColor White
        Write-Host "  • Ajout de filigranes" -ForegroundColor White
        Write-Host "  • Et bien plus..." -ForegroundColor White
        
    } else {
        Write-Host "Erreur lors du demarrage du service" -ForegroundColor Red
    }
    
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nDemarrage termine!" -ForegroundColor Green
