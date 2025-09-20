# Script pour forcer le redémarrage de cloudflared
Write-Host "🔄 Redémarrage forcé de cloudflared..." -ForegroundColor Yellow

# Arrêter tous les processus cloudflared
Write-Host "🛑 Arrêt de tous les processus cloudflared..." -ForegroundColor Red
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force
        Write-Host "   Processus $($_.Id) arrêté" -ForegroundColor White
    } catch {
        Write-Host "   Impossible d'arrêter le processus $($_.Id): $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# Attendre que les processus se terminent
Start-Sleep -Seconds 5

# Vérifier qu'aucun processus cloudflared ne fonctionne
$remainingProcesses = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($remainingProcesses) {
    Write-Host "⚠️ Certains processus cloudflared sont encore en cours d'exécution" -ForegroundColor Yellow
    $remainingProcesses | ForEach-Object {
        Write-Host "   PID: $($_.Id)" -ForegroundColor White
    }
} else {
    Write-Host "✅ Tous les processus cloudflared ont été arrêtés" -ForegroundColor Green
}

# Démarrer cloudflared avec la nouvelle configuration
Write-Host "`n🚀 Démarrage de cloudflared avec la nouvelle configuration..." -ForegroundColor Green
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "cloudflared-config.yml", "run" -WindowStyle Hidden

# Attendre que cloudflared démarre
Start-Sleep -Seconds 10

# Vérifier que cloudflared fonctionne
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "✅ Cloudflared redémarré avec succès (PID: $($cloudflaredProcess.Id))" -ForegroundColor Green
    
    # Tester la configuration
    Write-Host "`n🧪 Test de la nouvelle configuration..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
    try {
        $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
        Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
        if ($response.Headers.Location) {
            Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
            if ($response.Headers.Location -like "*login*") {
                Write-Host "✅ SUCCÈS: LibreSpeed redirige vers login!" -ForegroundColor Green
            } else {
                Write-Host "⚠️ LibreSpeed redirige vers: $($response.Headers.Location)" -ForegroundColor Yellow
            }
        } else {
            Write-Host "❌ LibreSpeed ne redirige pas (Status: $($response.StatusCode))" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "❌ Erreur lors du redémarrage de cloudflared!" -ForegroundColor Red
    exit 1
}

