# Script pour configurer les routes du tunnel iahome-tunnel
Write-Host "🔧 Configuration des routes du tunnel iahome-tunnel..." -ForegroundColor Yellow

# Vérifier que le tunnel existe
Write-Host "🔍 Vérification du tunnel iahome-tunnel..." -ForegroundColor Cyan
try {
    $tunnelInfo = & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel info iahome-tunnel
    Write-Host "✅ Tunnel iahome-tunnel trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ Tunnel iahome-tunnel non trouvé: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Configurer la route pour librespeed.iahome.fr
Write-Host "`n🌐 Configuration de la route pour librespeed.iahome.fr..." -ForegroundColor Cyan
Write-Host "Cette commande va configurer librespeed.iahome.fr pour pointer vers notre API de redirection" -ForegroundColor White
Write-Host "⚠️ ATTENTION: Cela va modifier la configuration dans Cloudflare!" -ForegroundColor Yellow

$confirm = Read-Host "Continuer? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Configuration annulée" -ForegroundColor Red
    exit 0
}

try {
    # Configurer la route DNS pour librespeed.iahome.fr
    Write-Host "🔗 Configuration de la route DNS..." -ForegroundColor Green
    & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel route dns iahome-tunnel librespeed.iahome.fr
    Write-Host "✅ Route DNS configurée" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la configuration de la route: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Redémarrer le tunnel avec notre configuration
Write-Host "`n🔄 Redémarrage du tunnel avec notre configuration..." -ForegroundColor Cyan
try {
    # Arrêter le tunnel
    & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel stop iahome-tunnel
    Start-Sleep -Seconds 5
    
    # Démarrer avec notre configuration
    $configPath = (Get-Location).Path + "\cloudflared-config.yml"
    Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" -ArgumentList "tunnel", "--config", $configPath, "run" -WindowStyle Hidden
    Write-Host "✅ Tunnel redémarré avec notre configuration" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du redémarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que le tunnel démarre
Start-Sleep -Seconds 15

# Tester la configuration
Write-Host "`n🧪 Test de la nouvelle configuration..." -ForegroundColor Cyan

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

Write-Host "`n🎯 Configuration des routes terminée!" -ForegroundColor Green
Write-Host "💡 Si LibreSpeed ne redirige toujours pas, vérifiez la configuration dans le dashboard Cloudflare" -ForegroundColor Yellow

