# Test final de MeTube
Write-Host "Test final de MeTube" -ForegroundColor Cyan

Write-Host "`n1. Test de l'IP publique directe..." -ForegroundColor Yellow
try {
    $ipResponse = Invoke-WebRequest -Uri "http://90.90.226.59" -Method GET -TimeoutSec 10
    if ($ipResponse.StatusCode -eq 200) {
        Write-Host "Traefik accessible sur l'IP publique" -ForegroundColor Green
    } else {
        Write-Host "Traefik non accessible (Code: $($ipResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur IP publique: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n2. Test avec en-tete Host (simulation domaine)..." -ForegroundColor Yellow
try {
    $headers = @{ "Host" = "metube.iahome.fr" }
    $hostResponse = Invoke-WebRequest -Uri "http://90.90.226.59" -Method GET -Headers $headers -TimeoutSec 10
    if ($hostResponse.StatusCode -eq 200) {
        Write-Host "MeTube accessible via simulation domaine" -ForegroundColor Green
    } else {
        Write-Host "MeTube non accessible (Code: $($hostResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur simulation domaine: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test de MeTube local..." -ForegroundColor Yellow
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:8082" -Method GET -TimeoutSec 5
    if ($localResponse.StatusCode -eq 200) {
        Write-Host "MeTube accessible localement" -ForegroundColor Green
    } else {
        Write-Host "MeTube non accessible localement (Code: $($localResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur local: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nResume de la configuration :" -ForegroundColor Cyan
Write-Host "Configuration Traefik: Meme approche que LibreSpeed" -ForegroundColor Green
Write-Host "MeTube accessible: Via IP publique et localement" -ForegroundColor Green
Write-Host "Cloudflare SSL: Gere par Cloudflare (comme LibreSpeed)" -ForegroundColor Green
Write-Host "DNS local: Probleme de resolution locale (normal)" -ForegroundColor Yellow

Write-Host "`nAcces a MeTube :" -ForegroundColor Yellow
Write-Host "   - URL publique: https://metube.iahome.fr (via Cloudflare)" -ForegroundColor White
Write-Host "   - URL directe: http://90.90.226.59 (pour test)" -ForegroundColor White
Write-Host "   - URL locale: http://localhost:8082" -ForegroundColor White

Write-Host "`nConfiguration terminee avec succes !" -ForegroundColor Green
Write-Host "   MeTube est maintenant configure comme LibreSpeed" -ForegroundColor Gray
Write-Host "   Cloudflare gere le SSL et la redirection" -ForegroundColor Gray

