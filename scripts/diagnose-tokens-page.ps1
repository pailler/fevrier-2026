Write-Host "Diagnostic de la page tokens..." -ForegroundColor Green

try {
    # Tester l'acces a la page
    Write-Host "`nTest d'acces a la page tokens..." -ForegroundColor Yellow
    $response = Invoke-WebRequest -Uri "https://iahome.fr/admin/tokens" -UseBasicParsing -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        Write-Host "Page tokens accessible!" -ForegroundColor Green
        
        # Analyser le contenu HTML
        $htmlContent = $response.Content
        
        # Verifier si c'est la page d'acces refuse
        $isAccessDenied = $htmlContent -match "Acces refuse" -or $htmlContent -match "Vous devez"
        $isLoginPage = $htmlContent -match "Se connecter" -or $htmlContent -match "login"
        $hasTokensContent = $htmlContent -match "Gestion des Tokens"
        $hasAdminContent = $htmlContent -match "Administration"
        
        Write-Host "`nAnalyse du contenu:" -ForegroundColor Cyan
        
        if ($isAccessDenied) {
            Write-Host "  ERREUR - Page d'acces refuse detectee" -ForegroundColor Red
            Write-Host "  Raison: Vous n'etes pas connecte en tant qu'admin" -ForegroundColor Yellow
        } else {
            Write-Host "  OK - Pas de page d'acces refuse" -ForegroundColor Green
        }
        
        if ($isLoginPage) {
            Write-Host "  ERREUR - Page de connexion detectee" -ForegroundColor Red
        } else {
            Write-Host "  OK - Pas de page de connexion" -ForegroundColor Green
        }
        
        if ($hasTokensContent) {
            Write-Host "  OK - Contenu de gestion des tokens present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Contenu de gestion des tokens manquant" -ForegroundColor Red
        }
        
        if ($hasAdminContent) {
            Write-Host "  OK - Contenu d'administration present" -ForegroundColor Green
        } else {
            Write-Host "  ERREUR - Contenu d'administration manquant" -ForegroundColor Red
        }
        
        # Verifier les erreurs JavaScript
        $hasJavaScriptErrors = $htmlContent -match "error" -or $htmlContent -match "Error"
        $hasConsoleLogs = $htmlContent -match "console.log"
        
        Write-Host "`nVerification JavaScript:" -ForegroundColor Cyan
        
        if ($hasJavaScriptErrors) {
            Write-Host "  ATTENTION - Erreurs JavaScript detectees" -ForegroundColor Yellow
        } else {
            Write-Host "  OK - Pas d'erreurs JavaScript detectees" -ForegroundColor Green
        }
        
        if ($hasConsoleLogs) {
            Write-Host "  OK - Logs console presents (debug)" -ForegroundColor Green
        } else {
            Write-Host "  INFO - Pas de logs console detectes" -ForegroundColor Gray
        }
        
        # Extraire des informations utiles
        $title = if ($htmlContent -match "<title>(.*?)</title>") { $matches[1] } else { "Titre non trouve" }
        Write-Host "`nTitre de la page: $title" -ForegroundColor Cyan
        
    } else {
        Write-Host "Page accessible mais statut: $($response.StatusCode)" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nInstructions de resolution:" -ForegroundColor Yellow
Write-Host "1. Allez sur https://iahome.fr/login" -ForegroundColor White
Write-Host "2. Connectez-vous avec un compte admin" -ForegroundColor White
Write-Host "3. Allez sur https://iahome.fr/admin/tokens" -ForegroundColor White
Write-Host "4. Ouvrez la console du navigateur (F12)" -ForegroundColor White
Write-Host "5. Verifiez les erreurs et les logs" -ForegroundColor White

Write-Host "`nDiagnostic termine!" -ForegroundColor Green




