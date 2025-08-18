# Script pour lister les utilisateurs existants
Write-Host "Liste des utilisateurs existants..." -ForegroundColor Green

# Test de l'API de debug pour voir les utilisateurs
Write-Host "`n1. Test de l'API de debug..." -ForegroundColor Yellow

try {
    $testData = @{
        userEmail = "admin@iahome.fr"
    } | ConvertTo-Json
    
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/debug-payment" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Debug API accessible" -ForegroundColor Green
    
    if ($response.success) {
        Write-Host "`nUtilisateur trouvé:" -ForegroundColor Cyan
        Write-Host "   ID: $($response.user.id)" -ForegroundColor White
        Write-Host "   Email: $($response.user.email)" -ForegroundColor White
        
        Write-Host "`nRésumé:" -ForegroundColor Cyan
        Write-Host "   Paiements: $($response.summary.totalPayments)" -ForegroundColor White
        Write-Host "   Applications: $($response.summary.totalApplications)" -ForegroundColor White
        Write-Host "   Tokens: $($response.summary.totalTokens)" -ForegroundColor White
        
        if ($response.userApplications) {
            Write-Host "`nApplications utilisateur:" -ForegroundColor Cyan
            foreach ($app in $response.userApplications) {
                Write-Host "   Module: $($app.module_title)" -ForegroundColor White
                Write-Host "   ID: $($app.module_id)" -ForegroundColor White
                Write-Host "   ---" -ForegroundColor Gray
            }
        }
    }
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des données: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nListe des utilisateurs termine !" -ForegroundColor Green
