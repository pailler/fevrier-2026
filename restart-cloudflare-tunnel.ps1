# Script pour redémarrer le tunnel Cloudflare avec la configuration réparée
# Usage: .\restart-cloudflare-tunnel.ps1

Write-Host "🔄 Redémarrage du tunnel Cloudflare iahome-new..." -ForegroundColor Cyan

# Arrêter le processus cloudflared existant
Write-Host "⏹️  Arrêt des processus cloudflared existants..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force

# Attendre un peu pour s'assurer que les processus sont arrêtés
Start-Sleep -Seconds 3

# Vérifier que le fichier de configuration existe
$configFile = "cloudflare-complete-config.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "❌ Erreur: Le fichier de configuration $configFile n'existe pas!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Configuration trouvée: $configFile" -ForegroundColor Green

# Démarrer le tunnel avec la nouvelle configuration
Write-Host "🚀 Démarrage du tunnel Cloudflare avec la configuration réparée..." -ForegroundColor Green
Write-Host "📍 Configuration: iahome.fr -> localhost:3000 (mode production)" -ForegroundColor Cyan

try {
    # Démarrer cloudflared en arrière-plan
    Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "--config", $configFile, "run" -WindowStyle Hidden
    
    # Attendre un peu pour que le tunnel se connecte
    Start-Sleep -Seconds 5
    
    # Vérifier que le processus est en cours d'exécution
    $process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($process) {
        Write-Host "✅ Tunnel Cloudflare démarré avec succès!" -ForegroundColor Green
        Write-Host "🌐 iahome.fr est maintenant accessible via Cloudflare" -ForegroundColor Cyan
        Write-Host "🔧 Port local: 3000 (mode production)" -ForegroundColor Cyan
        
        # Afficher les informations du processus
        Write-Host "`n📊 Informations du tunnel:" -ForegroundColor Yellow
        Write-Host "   PID: $($process.Id)" -ForegroundColor White
        Write-Host "   Mémoire: $([math]::Round($process.WorkingSet64 / 1MB, 2)) MB" -ForegroundColor White
        Write-Host "   Démarrage: $($process.StartTime)" -ForegroundColor White
        
    } else {
        Write-Host "❌ Erreur: Impossible de démarrer le tunnel Cloudflare" -ForegroundColor Red
        exit 1
    }
    
} catch {
    Write-Host "❌ Erreur lors du démarrage du tunnel: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Configuration Cloudflare réparée et tunnel redémarré!" -ForegroundColor Green
Write-Host "🔗 Testez l'accès à https://iahome.fr" -ForegroundColor Cyan
