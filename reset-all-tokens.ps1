# Script pour reinitialiser les tokens de tous les utilisateurs apres restauration Supabase
Write-Host "Reinitialisation des tokens pour tous les utilisateurs..." -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# URL de l'API (ajuster selon votre environnement)
$apiUrl = "http://localhost:3000/api/update-all-users-tokens"

# Si l'application est en production, utiliser l'URL de production
# $apiUrl = "https://iahome.fr/api/update-all-users-tokens"

Write-Host ""
Write-Host "Appel de l'API: $apiUrl" -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri $apiUrl -Method POST -ContentType "application/json" -ErrorAction Stop
    
    if ($response.success) {
        Write-Host ""
        Write-Host "Reinitialisation reussie !" -ForegroundColor Green
        Write-Host ""
        Write-Host "Resume:" -ForegroundColor Cyan
        Write-Host "   - Total utilisateurs: $($response.summary.totalUsers)" -ForegroundColor White
        Write-Host "   - Utilisateurs mis a jour: $($response.summary.updated)" -ForegroundColor Green
        Write-Host "   - Nouveaux enregistrements: $($response.summary.created)" -ForegroundColor Yellow
        Write-Host "   - Erreurs: $($response.summary.errors)" -ForegroundColor $(if ($response.summary.errors -gt 0) { "Red" } else { "Green" })
        
        if ($response.results) {
            Write-Host ""
            Write-Host "Details par utilisateur:" -ForegroundColor Cyan
            foreach ($result in $response.results) {
                $statusColor = switch ($result.status) {
                    "updated" { "Green" }
                    "created" { "Yellow" }
                    "error" { "Red" }
                    default { "White" }
                }
                $tokenInfo = if ($result.tokens) { " - $($result.tokens) tokens" } else { "" }
                Write-Host "   - $($result.email): $($result.status)$tokenInfo" -ForegroundColor $statusColor
            }
        }
        
        Write-Host ""
        Write-Host "Tous les utilisateurs ont maintenant des tokens !" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "Erreur lors de la reinitialisation:" -ForegroundColor Red
        Write-Host "   $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host ""
    Write-Host "Erreur lors de l'appel a l'API:" -ForegroundColor Red
    Write-Host "   $($_.Exception.Message)" -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $statusCode = $_.Exception.Response.StatusCode.value__
        Write-Host "   Code HTTP: $statusCode" -ForegroundColor Red
        
        try {
            $errorStream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($errorStream)
            $errorBody = $reader.ReadToEnd()
            Write-Host "   Reponse: $errorBody" -ForegroundColor Red
        } catch {
            Write-Host "   Impossible de lire la reponse d'erreur" -ForegroundColor Yellow
        }
    }
    
    Write-Host ""
    Write-Host "Verifiez que:" -ForegroundColor Yellow
    Write-Host "   1. L'application est en cours d'execution" -ForegroundColor Yellow
    Write-Host "   2. L'URL de l'API est correcte" -ForegroundColor Yellow
    Write-Host "   3. Supabase est accessible" -ForegroundColor Yellow
}

Write-Host ""
