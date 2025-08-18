Write-Host "Test de la nouvelle modal de confirmation de suppression..." -ForegroundColor Green

try {
    # Tester l'acces a la page
    Write-Host "`nTest d'acces a la page tokens..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://iahome.fr/admin/tokens" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Page tokens accessible!" -ForegroundColor Green
        
        # Analyser le contenu HTML pour verifier la modal
        $htmlContent = $response.Content
        
        # Verifier la presence de la modal
        $hasModal = $htmlContent -match "Modal de confirmation de suppression"
        $hasConfirmButton = $htmlContent -match "Confirmer la suppression"
        $hasCancelButton = $htmlContent -match "Annuler"
        $hasDeleteButton = $htmlContent -match "Supprimer"
        $hasShowDeleteConfirm = $htmlContent -match "showDeleteConfirm"
        
        Write-Host "`nVerification de la modal:" -ForegroundColor Cyan
        
        if ($hasModal) {
            Write-Host "  OK - Modal de confirmation detectee" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Modal de confirmation manquante" -ForegroundColor Red
        }
        
        if ($hasConfirmButton) {
            Write-Host "  OK - Bouton 'Confirmer la suppression' present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Bouton 'Confirmer la suppression' manquant" -ForegroundColor Red
        }
        
        if ($hasCancelButton) {
            Write-Host "  OK - Bouton 'Annuler' present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Bouton 'Annuler' manquant" -ForegroundColor Red
        }
        
        if ($hasDeleteButton) {
            Write-Host "  OK - Bouton 'Supprimer' present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Bouton 'Supprimer' manquant" -ForegroundColor Red
        }
        
        if ($hasShowDeleteConfirm) {
            Write-Host "  OK - Etat showDeleteConfirm present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Etat showDeleteConfirm manquant" -ForegroundColor Red
        }
        
        # Verifier les fonctions JavaScript
        $hasConfirmDeleteToken = $htmlContent -match "confirmDeleteToken"
        $hasCancelDeleteToken = $htmlContent -match "cancelDeleteToken"
        
        Write-Host "`nVerification des fonctions JavaScript:" -ForegroundColor Cyan
        
        if ($hasConfirmDeleteToken) {
            Write-Host "  OK - Fonction confirmDeleteToken presente" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Fonction confirmDeleteToken manquante" -ForegroundColor Red
        }
        
        if ($hasCancelDeleteToken) {
            Write-Host "  OK - Fonction cancelDeleteToken presente" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Fonction cancelDeleteToken manquante" -ForegroundColor Red
        }
        
    } else {
        Write-Host "Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nInstructions de test manuel:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/admin/tokens" -ForegroundColor White
Write-Host "2. Connectez-vous en tant qu'admin" -ForegroundColor White
Write-Host "3. Cliquez sur 'Supprimer' pour un token" -ForegroundColor White
Write-Host "4. Une modal moderne doit s'afficher avec:" -ForegroundColor White
Write-Host "   • Un titre 'Confirmer la suppression'" -ForegroundColor White
Write-Host "   • Un message d'avertissement" -ForegroundColor White
Write-Host "   • Deux boutons: 'Annuler' (gris) et 'Supprimer' (rouge)" -ForegroundColor White
Write-Host "5. Cliquez sur 'Supprimer' pour confirmer la suppression" -ForegroundColor White

Write-Host "`nTest termine!" -ForegroundColor Green




