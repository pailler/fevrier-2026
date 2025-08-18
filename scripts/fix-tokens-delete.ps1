Write-Host "Correction de la suppression des tokens..." -ForegroundColor Green

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

Write-Host "`nCorrections appliquees:" -ForegroundColor Cyan
Write-Host "   • Amelioration de la fonction handleDeleteToken avec plus de logs" -ForegroundColor White
Write-Host "   • Ajout de verification de l'ID du token avant suppression" -ForegroundColor White
Write-Host "   • Amelioration des boutons avec meilleur style et logs" -ForegroundColor White
Write-Host "   • Ajout de .select() pour recuperer les donnees supprimees" -ForegroundColor White
Write-Host "   • Utilisation de setTokens avec fonction callback pour eviter les problemes de closure" -ForegroundColor White

Write-Host "`nInstructions de test:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/admin/tokens" -ForegroundColor White
Write-Host "2. Connectez-vous en tant qu'admin" -ForegroundColor White
Write-Host "3. Ouvrez la console du navigateur (F12)" -ForegroundColor White
Write-Host "4. Cliquez sur 'Supprimer' pour un token" -ForegroundColor White
Write-Host "5. Verifiez les logs dans la console" -ForegroundColor White

Write-Host "`nCorrection terminee!" -ForegroundColor Green




