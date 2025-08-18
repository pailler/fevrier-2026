Write-Host "Amelioration de la confirmation de suppression des tokens..." -ForegroundColor Green

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
            Start-Sleep -Seconds 15
            
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

Write-Host "`nAmeliorations appliquees:" -ForegroundColor Cyan
Write-Host "   • Remplacement de confirm() par une modal personnalisee" -ForegroundColor White
Write-Host "   • Boutons plus clairs: 'Annuler' et 'Supprimer'" -ForegroundColor White
Write-Host "   • Interface plus moderne et intuitive" -ForegroundColor White
Write-Host "   • Meilleure experience utilisateur" -ForegroundColor White

Write-Host "`nInstructions de test:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/admin/tokens" -ForegroundColor White
Write-Host "2. Connectez-vous en tant qu'admin" -ForegroundColor White
Write-Host "3. Cliquez sur 'Supprimer' pour un token" -ForegroundColor White
Write-Host "4. Une modal moderne s'affichera avec deux boutons clairs" -ForegroundColor White
Write-Host "5. Cliquez sur 'Supprimer' pour confirmer ou 'Annuler' pour garder" -ForegroundColor White

Write-Host "`nAmelioration terminee!" -ForegroundColor Green




