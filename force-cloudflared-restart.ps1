# Script pour forcer le redémarrage de cloudflared avec notre configuration
Write-Host "🔄 Redémarrage forcé de cloudflared avec notre configuration..." -ForegroundColor Yellow

# Arrêter le service cloudflared
Write-Host "🛑 Arrêt du service cloudflared..." -ForegroundColor Red
try {
    Stop-Service -Name "Cloudflared" -Force
    Start-Sleep -Seconds 5
    Write-Host "✅ Service cloudflared arrêté" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Vérifier qu'aucun processus cloudflared ne fonctionne
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "🛑 Arrêt forcé des processus cloudflared restants..." -ForegroundColor Red
    $processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force
            Write-Host "   Processus $($_.Id) arrêté" -ForegroundColor White
        } catch {
            Write-Host "   Impossible d'arrêter le processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
}

# Démarrer cloudflared avec notre configuration
Write-Host "🚀 Démarrage de cloudflared avec notre configuration..." -ForegroundColor Green
$configPath = (Get-Location).Path + "\cloudflared-config.yml"
Write-Host "   Configuration: $configPath" -ForegroundColor White

try {
    Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" -ArgumentList "tunnel", "--config", $configPath, "run" -WindowStyle Hidden
    Write-Host "✅ Cloudflared démarré avec notre configuration" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que cloudflared démarre
Start-Sleep -Seconds 10

# Vérifier que cloudflared fonctionne
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "✅ Cloudflared fonctionne (PID: $($cloudflaredProcess.Id))" -ForegroundColor Green
    
    # Tester la configuration
    Write-Host "`n🧪 Test de la configuration..." -ForegroundColor Cyan
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
    Write-Host "❌ Cloudflared ne fonctionne pas!" -ForegroundColor Red
    exit 1
}

