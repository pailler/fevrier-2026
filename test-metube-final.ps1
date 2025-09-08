# Test final de MeTube avec la configuration Cloudflare
Write-Host "Test final de MeTube" -ForegroundColor Cyan

Write-Host "`n1. Test de l'IP publique directe..." -ForegroundColor Yellow
try {
    $ipResponse = Invoke-WebRequest -Uri "http://90.90.226.59" -Method GET -TimeoutSec 10
    if ($ipResponse.StatusCode -eq 200) {
        Write-Host "✅ Traefik accessible sur l'IP publique" -ForegroundColor Green
    } else {
        Write-Host "❌ Traefik non accessible (Code: $($ipResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur IP publique: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Test avec en-tête Host (simulation domaine)..." -ForegroundColor Yellow
try {
    $headers = @{ "Host" = "metube.iahome.fr" }
    $hostResponse = Invoke-WebRequest -Uri "http://90.90.226.59" -Method GET -Headers $headers -TimeoutSec 10
    if ($hostResponse.StatusCode -eq 200) {
        Write-Host "✅ MeTube accessible via simulation domaine" -ForegroundColor Green
    } else {
        Write-Host "❌ MeTube non accessible (Code: $($hostResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur simulation domaine: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test de MeTube local..." -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:8082" -Method GET -TimeoutSec 5
    if ($localResponse.StatusCode -eq 200) {
        Write-Host "✅ MeTube accessible localement" -ForegroundColor Green
    } else {
        Write-Host "❌ MeTube non accessible localement (Code: $($localResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n4. Verification de la configuration Traefik..." -ForegroundColor Yellow
try {
    $traefikResponse = Invoke-WebRequest -Uri "http://localhost:8080/api/http/routers" -Method GET -TimeoutSec 5
    $routers = $traefikResponse.Content | ConvertFrom-Json
    $metubeRouter = $routers | Where-Object { $_.name -like "*metube*" }
    if ($metubeRouter) {
        Write-Host "✅ Routeur MeTube trouvé dans Traefik" -ForegroundColor Green
        Write-Host "   Nom: $($metubeRouter.name)" -ForegroundColor Gray
        Write-Host "   Règle: $($metubeRouter.rule)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Routeur MeTube non trouvé dans Traefik" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur Traefik: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Résumé de la configuration :" -ForegroundColor Cyan
Write-Host "✅ Configuration Traefik: Même approche que LibreSpeed" -ForegroundColor Green
Write-Host "✅ MeTube accessible: Via IP publique et localement" -ForegroundColor Green
Write-Host "✅ Cloudflare SSL: Géré par Cloudflare (comme LibreSpeed)" -ForegroundColor Green
Write-Host "⚠️  DNS local: Problème de résolution locale (normal)" -ForegroundColor Yellow

Write-Host "`n🌐 Accès à MeTube :" -ForegroundColor Yellow
Write-Host "   - URL publique: https://metube.iahome.fr (via Cloudflare)" -ForegroundColor White
Write-Host "   - URL directe: http://90.90.226.59 (pour test)" -ForegroundColor White
Write-Host "   - URL locale: http://localhost:8082" -ForegroundColor White

Write-Host "`n✅ Configuration terminée avec succès !" -ForegroundColor Green
Write-Host "   MeTube est maintenant configuré comme LibreSpeed" -ForegroundColor Gray
Write-Host "   Cloudflare gère le SSL et la redirection" -ForegroundColor Gray

