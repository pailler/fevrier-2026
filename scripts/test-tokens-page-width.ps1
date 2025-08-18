Write-Host "Test de la largeur de la page tokens..." -ForegroundColor Green

try {
    # Tester l'acces a la page
    Write-Host "`nTest d'acces a la page tokens..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://iahome.fr/admin/tokens" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Page tokens accessible!" -ForegroundColor Green
        
        # Analyser le contenu HTML pour verifier les classes CSS
        $htmlContent = $response.Content
        
        # Verifier les modifications appliquees
        $checks = @{
            "w-full" = $htmlContent -match "w-full"
            "max-w-7xl" = $htmlContent -match "max-w-7xl"
            "lg:grid-cols-3" = $htmlContent -match "lg:grid-cols-3"
            "lg:grid-cols-4" = $htmlContent -match "lg:grid-cols-4"
        }
        
        Write-Host "`nVerification des modifications:" -ForegroundColor Cyan
        
        if ($checks["w-full"]) {
            Write-Host "  ✓ Classe 'w-full' presente" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Classe 'w-full' manquante" -ForegroundColor Red
        }
        
        if (-not $checks["max-w-7xl"]) {
            Write-Host "  ✓ Classe 'max-w-7xl' supprimee" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Classe 'max-w-7xl' encore presente" -ForegroundColor Red
        }
        
        if ($checks["lg:grid-cols-3"]) {
            Write-Host "  ✓ Grille 3 colonnes appliquee" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Grille 3 colonnes non appliquee" -ForegroundColor Red
        }
        
        if ($checks["lg:grid-cols-4"]) {
            Write-Host "  ✓ Grille 4 colonnes pour configuration" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Grille 4 colonnes non appliquee" -ForegroundColor Red
        }
        
        Write-Host "`nURL de la page: https://iahome.fr/admin/tokens" -ForegroundColor Cyan
        Write-Host "Note: Connectez-vous en tant qu'admin pour voir la page complete" -ForegroundColor Yellow
        
    } else {
        Write-Host "Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Cela peut etre normal si vous n'etes pas connecte en tant qu'admin" -ForegroundColor Yellow
}

Write-Host "`nTest termine!" -ForegroundColor Green




