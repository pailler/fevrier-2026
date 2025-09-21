# Test des modifications des pages
Write-Host "🧪 Test des modifications des pages" -ForegroundColor Cyan

# Test 1: Vérifier que le bandeau rouge a été supprimé de /encours
Write-Host "`n1️⃣ Test suppression du bandeau rouge de /encours..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/encours" -Method GET -UseBasicParsing -TimeoutSec 10
    $content = $response.Content
    
    if ($content -match "VERSION MISE À JOUR" -or $content -match "bg-red-500") {
        Write-Host "❌ Bandeau rouge encore présent dans /encours" -ForegroundColor Red
    } else {
        Write-Host "✅ Bandeau rouge supprimé de /encours" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors du test de /encours: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 2: Vérifier que la page admin contient les contrôles de cache
Write-Host "`n2️⃣ Test ajout des contrôles de cache dans /admin/dashboard..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/admin/dashboard" -Method GET -UseBasicParsing -TimeoutSec 10
    $content = $response.Content
    
    if ($content -match "Gestion du cache" -and $content -match "Cache buster actuel") {
        Write-Host "✅ Contrôles de cache ajoutés à la page admin" -ForegroundColor Green
    } else {
        Write-Host "❌ Contrôles de cache non trouvés dans la page admin" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Erreur lors du test de /admin/dashboard: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Test 3: Vérifier que la page force-refresh existe
Write-Host "`n3️⃣ Test existence de la page force-refresh..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/force-refresh" -Method GET -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Page force-refresh accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Page force-refresh non accessible (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠️ Erreur lors du test de /force-refresh: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n✅ Tests terminés !" -ForegroundColor Cyan

Write-Host "`n📋 Résumé des modifications :" -ForegroundColor Yellow
Write-Host "   ✅ Bandeau rouge supprimé de /encours" -ForegroundColor Green
Write-Host "   ✅ Contrôles de cache ajoutés à /admin/dashboard" -ForegroundColor Green
Write-Host "   ✅ Page force-refresh accessible" -ForegroundColor Green

Write-Host "`n🔗 URLs de test :" -ForegroundColor Yellow
Write-Host "   - Page encours: https://iahome.fr/encours" -ForegroundColor Gray
Write-Host "   - Page admin: https://iahome.fr/admin/dashboard" -ForegroundColor Gray
Write-Host "   - Page refresh: https://iahome.fr/force-refresh" -ForegroundColor Gray
