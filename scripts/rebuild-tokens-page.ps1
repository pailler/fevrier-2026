Write-Host "Reconstruction de l'application apres modification de la page tokens..." -ForegroundColor Green

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
            Start-Sleep -Seconds 10
            
            # Tester l'acces a la page
            Write-Host "`nTest d'acces a la page tokens..." -ForegroundColor Yellow
            try {
                $response = Invoke-WebRequest -Uri "https://iahome.fr/admin/tokens" -UseBasicParsing -TimeoutSec 30
                if ($response.StatusCode -eq 200) {
                    Write-Host "Page tokens accessible!" -ForegroundColor Green
                    Write-Host "URL: https://iahome.fr/admin/tokens" -ForegroundColor Cyan
                } else {
                    Write-Host "Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
                }
            } catch {
                Write-Host "Impossible de tester la page (normal si pas connecte): $($_.Exception.Message)" -ForegroundColor Yellow
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

Write-Host "`nModifications appliquees:" -ForegroundColor Cyan
Write-Host "   • Largeur maximale supprimee (w-full au lieu de max-w-7xl)" -ForegroundColor White
Write-Host "   • Grille du formulaire elargie (3 colonnes au lieu de 2)" -ForegroundColor White
Write-Host "   • Tableau utilise toute la largeur disponible" -ForegroundColor White
Write-Host "   • Configuration des tokens par defaut elargie (4 colonnes)" -ForegroundColor White

Write-Host "`nReconstruction terminee!" -ForegroundColor Green
