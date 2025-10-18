# Script pour redémarrer Cloudflare avec la bonne configuration

Write-Host "Arret des processus cloudflared..." -ForegroundColor Yellow

# Essayer d'arrêter tous les processus cloudflared
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction Stop
        Write-Host "Processus $($_.Id) arrêté" -ForegroundColor Green
    } catch {
        Write-Host "Impossible d'arrêter le processus $($_.Id): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Start-Sleep -Seconds 3

Write-Host "Démarrage du tunnel avec la nouvelle configuration..." -ForegroundColor Yellow

# Démarrer le tunnel avec la configuration mise à jour
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "cloudflare-complete-config.yml", "run" -WindowStyle Normal

Write-Host "Tunnel démarré. Attente de 10 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "Test de connectivité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method HEAD -TimeoutSec 10
    Write-Host "✅ Succès: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}
