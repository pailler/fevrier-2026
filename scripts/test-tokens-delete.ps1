Write-Host "Test de la suppression des tokens..." -ForegroundColor Green

try {
    # Tester l'acces a la page
    Write-Host "`nTest d'acces a la page tokens..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://iahome.fr/admin/tokens" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Page tokens accessible!" -ForegroundColor Green
        
        # Analyser le contenu HTML pour verifier les boutons
        $htmlContent = $response.Content
        
        # Verifier la presence des boutons
        $hasDeleteButtons = $htmlContent -match "Supprimer"
        $hasEditButtons = $htmlContent -match "Modifier"
        $hasTokens = $htmlContent -match "token"
        
        Write-Host "`nVerification de l'interface:" -ForegroundColor Cyan
        
        if ($hasDeleteButtons) {
            Write-Host "  OK - Boutons 'Supprimer' presents" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Boutons 'Supprimer' manquants" -ForegroundColor Red
        }
        
        if ($hasEditButtons) {
            Write-Host "  OK - Boutons 'Modifier' presents" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Boutons 'Modifier' manquants" -ForegroundColor Red
        }
        
        if ($hasTokens) {
            Write-Host "  OK - Contenu des tokens present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Contenu des tokens manquant" -ForegroundColor Red
        }
        
        # Verifier les fonctions JavaScript
        $hasHandleDelete = $htmlContent -match "handleDeleteToken"
        $hasHandleEdit = $htmlContent -match "handleEditToken"
        
        Write-Host "`nVerification des fonctions JavaScript:" -ForegroundColor Cyan
        
        if ($hasHandleDelete) {
            Write-Host "  OK - Fonction handleDeleteToken presente" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Fonction handleDeleteToken manquante" -ForegroundColor Red
        }
        
        if ($hasHandleEdit) {
            Write-Host "  OK - Fonction handleEditToken presente" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Fonction handleEditToken manquante" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green
