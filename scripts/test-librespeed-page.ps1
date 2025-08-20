# Script pour tester la page LibreSpeed
Write-Host "Test de la page LibreSpeed" -ForegroundColor Cyan

# 1. Vérifier les services Docker
Write-Host "`nStatut des services Docker:" -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# 2. Tester l'accès à la page LibreSpeed
Write-Host "`nTest de la page LibreSpeed:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/card/librespeed" -Method Get -TimeoutSec 10
    Write-Host "✅ Page LibreSpeed accessible: $($response.StatusCode)" -ForegroundColor Green
    
    # Vérifier si le contenu contient des éléments dynamiques
    $content = $response.Content
    if ($content -match "card\.title") {
        Write-Host "✅ Titre dynamique détecté" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Titre statique détecté" -ForegroundColor Yellow
    }
    
    if ($content -match "card\.description") {
        Write-Host "✅ Description dynamique détectée" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Description statique détectée" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "❌ Erreur page LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Tester l'API pour récupérer les données du module LibreSpeed
Write-Host "`nTest de l'API modules:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/check-modules" -Method Get -TimeoutSec 10
    $modules = $response.Content | ConvertFrom-Json
    
    $librespeedModule = $modules | Where-Object { $_.title -like "*librespeed*" -or $_.id -eq "librespeed" }
    if ($librespeedModule) {
        Write-Host "✅ Module LibreSpeed trouvé:" -ForegroundColor Green
        Write-Host "   ID: $($librespeedModule.id)" -ForegroundColor White
        Write-Host "   Titre: $($librespeedModule.title)" -ForegroundColor White
        Write-Host "   Description: $($librespeedModule.description.Substring(0, [Math]::Min(100, $librespeedModule.description.Length)))..." -ForegroundColor White
    } else {
        Write-Host "❌ Module LibreSpeed non trouvé" -ForegroundColor Red
    }
    
} catch {
    Write-Host "❌ Erreur API modules: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test en production
Write-Host "`nTest en production:" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/card/librespeed" -Method Head -TimeoutSec 10
    Write-Host "✅ Production accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur production: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTests termines" -ForegroundColor Green
Write-Host "Page accessible sur:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:3000/card/librespeed" -ForegroundColor White
Write-Host "   - Production: https://iahome.fr/card/librespeed" -ForegroundColor White

