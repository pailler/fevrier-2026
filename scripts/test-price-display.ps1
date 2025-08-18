# Test de l'affichage des prix des modules
Write-Host "Test de l'affichage des prix des modules..." -ForegroundColor Green

try {
    $modulesResponse = Invoke-RestMethod -Uri "https://iahome.fr/api/check-modules" -Method GET
    
    if ($modulesResponse.success) {
        Write-Host "✅ Modules disponibles: $($modulesResponse.summary.totalModules)" -ForegroundColor Green
        
        Write-Host "`nPrix des modules:" -ForegroundColor Cyan
        foreach ($module in $modulesResponse.modules) {
            $priceDisplay = if ($module.price -eq 0) { "Free" } else { "$($module.price)€" }
            Write-Host "   $($module.title): $priceDisplay" -ForegroundColor White
        }
        
        # Compter les modules gratuits
        $freeModules = ($modulesResponse.modules | Where-Object { $_.price -eq 0 }).Count
        $paidModules = ($modulesResponse.modules | Where-Object { $_.price -gt 0 }).Count
        
        Write-Host "`nResume:" -ForegroundColor Yellow
        Write-Host "   Modules gratuits: $freeModules" -ForegroundColor Green
        Write-Host "   Modules payants: $paidModules" -ForegroundColor Blue
        
    } else {
        Write-Host "❌ Erreur: $($modulesResponse.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest termine!" -ForegroundColor Green






