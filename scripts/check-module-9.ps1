# Script pour vérifier le module avec l'ID 9
Write-Host "🔍 Vérification du module avec l'ID 9..." -ForegroundColor Cyan

# Test de l'API pour récupérer les modules
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/check-modules" -Method Get
    $modules = $response.Content | ConvertFrom-Json
    
    Write-Host "`n📋 Modules disponibles:" -ForegroundColor Yellow
    $modules | ForEach-Object {
        Write-Host "ID: $($_.id) - Titre: $($_.title) - Catégorie: $($_.category)" -ForegroundColor White
    }
    
    # Chercher le module avec l'ID 9
    $module9 = $modules | Where-Object { $_.id -eq 9 }
    if ($module9) {
        Write-Host "`n✅ Module trouvé avec l'ID 9:" -ForegroundColor Green
        Write-Host "   Titre: $($module9.title)" -ForegroundColor White
        Write-Host "   Description: $($module9.description)" -ForegroundColor White
        Write-Host "   Catégorie: $($module9.category)" -ForegroundColor White
        Write-Host "   Prix: $($module9.price)" -ForegroundColor White
    } else {
        Write-Host "`n❌ Aucun module trouvé avec l'ID 9" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur lors de la récupération des modules: $($_.Exception.Message)" -ForegroundColor Red
}

# Test direct de la page module-9
Write-Host "`n🌐 Test de la page module-9..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/card/module-9" -Method Head
    Write-Host "✅ Page module-9 accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur page module-9: $($_.Exception.Message)" -ForegroundColor Red
}
