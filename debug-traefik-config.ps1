# Script de debug de la configuration Traefik
# Compatible Windows PowerShell

Write-Host "🔍 Debug de la configuration Traefik..." -ForegroundColor Green

Write-Host "`n📊 1. État des conteneurs :" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | grep -E "(traefik|metube|librespeed|pdf|psitransfer)"

Write-Host "`n📋 2. Configuration Traefik chargée :" -ForegroundColor Cyan
Write-Host "Accès au dashboard Traefik : http://localhost:8080" -ForegroundColor Yellow

Write-Host "`n🌐 3. Test d'accès aux APIs Traefik :" -ForegroundColor Cyan

try {
    $api = Invoke-WebRequest -Uri "http://localhost:8080/api/rawdata" -UseBasicParsing -TimeoutSec 10
    Write-Host "✅ API Traefik accessible" -ForegroundColor Green
    
    # Parse JSON pour vérifier les middlewares
    $config = $api.Content | ConvertFrom-Json
    
    if ($config.http.middlewares.'iahome-whitelist') {
        Write-Host "✅ Middleware iahome-whitelist trouvé" -ForegroundColor Green
        Write-Host "   SourceRange:" $config.http.middlewares.'iahome-whitelist'.ipWhiteList.sourceRange -ForegroundColor White
    } else {
        Write-Host "❌ Middleware iahome-whitelist NON TROUVÉ" -ForegroundColor Red
    }
    
    # Vérifier les routers
    Write-Host "`n🔀 4. Routers configurés :" -ForegroundColor Cyan
    if ($config.http.routers) {
        foreach ($router in $config.http.routers.PSObject.Properties) {
            if ($router.Name -like "*librespeed*" -or $router.Name -like "*metube*" -or $router.Name -like "*pdf*" -or $router.Name -like "*psitransfer*") {
                Write-Host "   Router: $($router.Name)" -ForegroundColor Yellow
                Write-Host "     Rule: $($router.Value.rule)" -ForegroundColor White
                Write-Host "     Middlewares: $($router.Value.middlewares -join ', ')" -ForegroundColor White
            }
        }
    }
    
} catch {
    Write-Host "❌ Erreur d'accès à l'API Traefik: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📝 5. Logs Traefik récents :" -ForegroundColor Cyan
docker logs iahome-traefik --tail=5

Write-Host "`n🔧 6. Actions recommandées :" -ForegroundColor Yellow
Write-Host "1. Vérifier la configuration dans traefik/middlewares.yml" -ForegroundColor White
Write-Host "2. Vérifier la configuration dans traefik/routes.yml" -ForegroundColor White
Write-Host "3. Redémarrer Traefik si nécessaire" -ForegroundColor White
Write-Host "4. Tester avec curl depuis une autre IP" -ForegroundColor White
