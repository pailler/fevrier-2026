# Vérification de la table modules
Write-Host "Verification de la table modules..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/check-modules" -Method GET
    Write-Host "API accessible" -ForegroundColor Green
    
    if ($response.success) {
        Write-Host "`nModules disponibles ($($response.summary.totalModules)):" -ForegroundColor Cyan
        foreach ($module in $response.modules) {
            Write-Host "   ID: $($module.id) - Titre: $($module.title)" -ForegroundColor White
        }
        
        if ($response.ruinedfooocus.Count -gt 0) {
            Write-Host "`nModule RuinedFooocus trouve:" -ForegroundColor Green
            foreach ($rf in $response.ruinedfooocus) {
                Write-Host "   ID: $($rf.id) - Titre: $($rf.title)" -ForegroundColor White
                Write-Host "   Type ID: $($rf.id.GetType().Name)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "`n❌ Module RuinedFooocus non trouve!" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erreur: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nVerification terminee!" -ForegroundColor Green
