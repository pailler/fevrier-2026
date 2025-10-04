# Script pour forcer la mise à jour du module MeTube
Write-Host "🔧 FORCE UPDATE METUBE" -ForegroundColor Cyan
Write-Host "=====================" -ForegroundColor Cyan

# Test 1: Appel API avec debug
Write-Host "`n1. Test API avec debug..." -ForegroundColor Yellow
try {
    $testData = @{
        userId = "77e8d61e-dbec-49fe-bd5a-517fc495c84a"
        moduleId = "metube"
    } | ConvertTo-Json
    
    Write-Host "   Données envoyées: $testData" -ForegroundColor Gray
    
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/add-module-to-encours" -Method POST -Body $testData -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    
    Write-Host "   Code de réponse: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   Contenu: $($response.Content)" -ForegroundColor Gray
    
    if ($response.StatusCode -eq 200) {
        $result = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ API répond: $($result.message)" -ForegroundColor Green
    }
} catch {
    Write-Host "   ❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérification directe en base
Write-Host "`n2. Vérification des modules utilisateur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/user-modules?userId=77e8d61e-dbec-49fe-bd5a-517fc495c84a" -UseBasicParsing -TimeoutSec 10
    
    if ($response.StatusCode -eq 200) {
        $modules = $response.Content | ConvertFrom-Json
        Write-Host "   ✅ Modules trouvés: $($modules.Count)" -ForegroundColor Green
        
        foreach ($module in $modules) {
            if ($module.module_id -eq "metube") {
                Write-Host "   - MeTube: $($module.module_title) (ID: $($module.module_id))" -ForegroundColor Yellow
            }
        }
    }
} catch {
    Write-Host "   ❌ Erreur vérification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 DIAGNOSTIC TERMINÉ" -ForegroundColor Yellow
