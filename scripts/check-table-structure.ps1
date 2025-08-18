# Vérification de la structure de la table user_applications
Write-Host "Verification de la structure de la table user_applications..." -ForegroundColor Green

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/check-table-structure" -Method GET
    Write-Host "API accessible" -ForegroundColor Green
    
    if ($response.success) {
        Write-Host "`nColonnes disponibles:" -ForegroundColor Cyan
        foreach ($column in $response.columns) {
            Write-Host "   - $column" -ForegroundColor White
        }
        
        if ($response.sample.Count -gt 0) {
            Write-Host "`nExemple de données:" -ForegroundColor Cyan
            $firstSample = $response.sample[0]
            foreach ($key in $firstSample.PSObject.Properties.Name) {
                Write-Host "   $key : $($firstSample.$key)" -ForegroundColor White
            }
        }
    } else {
        Write-Host "❌ Erreur: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nVerification terminee!" -ForegroundColor Green






