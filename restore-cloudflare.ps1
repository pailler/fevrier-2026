# Script de restauration du tunnel Cloudflare
# Ce script restaure et redémarre le tunnel Cloudflare avec la configuration complète

Write-Host "🔄 Restauration du tunnel Cloudflare..." -ForegroundColor Cyan

# Vérifier si cloudflared est installé (priorité au fichier local)
$cloudflaredExe = ".\cloudflared.exe"
if (-not (Test-Path $cloudflaredExe)) {
    $cloudflaredExe = "cloudflared"
}

try {
    $cloudflaredVersion = & $cloudflaredExe --version 2>&1
    Write-Host "✅ Cloudflared détecté: $cloudflaredVersion" -ForegroundColor Green
    Write-Host "   Chemin: $cloudflaredExe" -ForegroundColor Gray
} catch {
    Write-Host "❌ Cloudflared n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# Vérifier l'existence du fichier de configuration
$configFile = "cloudflare-active-config.yml"
if (-not (Test-Path $configFile)) {
    Write-Host "❌ Fichier de configuration non trouvé: $configFile" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier de configuration trouvé: $configFile" -ForegroundColor Green

# Arrêter les processus cloudflared existants
Write-Host "🛑 Arrêt des processus cloudflared existants..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($processes) {
        foreach ($proc in $processes) {
            Write-Host "   Arrêt du processus PID: $($proc.Id)" -ForegroundColor Gray
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 3
        Write-Host "✅ Processus cloudflared arrêtés" -ForegroundColor Green
    } else {
        Write-Host "✅ Aucun processus cloudflared en cours" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt des processus: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Vérifier le statut du tunnel avant démarrage
Write-Host "🔍 Vérification du statut du tunnel iahome-new..." -ForegroundColor Yellow
$tunnelInfo = & $cloudflaredExe tunnel info iahome-new 2>&1
Write-Host $tunnelInfo -ForegroundColor Gray

# Démarrer le tunnel avec la configuration complète
Write-Host "`n🚀 Démarrage du tunnel Cloudflare avec la configuration complète..." -ForegroundColor Cyan
Write-Host "   Configuration: $configFile" -ForegroundColor Gray
Write-Host "   Tunnel: iahome-new" -ForegroundColor Gray

try {
    # Démarrer le tunnel en arrière-plan avec la configuration
    $configPath = Resolve-Path $configFile
    $cloudflaredPath = Resolve-Path $cloudflaredExe -ErrorAction SilentlyContinue
    if (-not $cloudflaredPath) {
        $cloudflaredPath = $cloudflaredExe
    }
    Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    
    Write-Host "✅ Commande de démarrage lancée" -ForegroundColor Green
    
    # Attendre que le tunnel se connecte
    Write-Host "⏳ Attente de la connexion du tunnel (15 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    
    # Vérifier à nouveau le statut
    Write-Host "`n🔍 Vérification du statut après démarrage..." -ForegroundColor Yellow
    $tunnelInfoAfter = & $cloudflaredExe tunnel info iahome-new 2>&1
    
    if ($tunnelInfoAfter -match "CONNECTOR ID" -or $tunnelInfoAfter -match "connection") {
        Write-Host "✅ Tunnel iahome-new semble actif!" -ForegroundColor Green
        Write-Host $tunnelInfoAfter -ForegroundColor Gray
    } else {
        Write-Host "⚠️ Statut du tunnel:" -ForegroundColor Yellow
        Write-Host $tunnelInfoAfter -ForegroundColor Gray
        Write-Host "💡 Le tunnel peut prendre quelques secondes supplémentaires pour se connecter" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage du tunnel: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Vérifiez la configuration du tunnel dans Cloudflare Dashboard" -ForegroundColor Yellow
}

# Tester l'accessibilité du site principal
Write-Host "`n🌐 Test d'accessibilité du site principal..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site accessible via Cloudflare: https://iahome.fr" -ForegroundColor Green
        Write-Host "📊 Statut: $($response.StatusCode)" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Site répond avec le code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Site non accessible actuellement: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "💡 Cela peut être normal si le tunnel est encore en cours de connexion" -ForegroundColor Yellow
    Write-Host "💡 Attendez quelques secondes et réessayez" -ForegroundColor Yellow
}

Write-Host "`n📋 Liste des tunnels disponibles:" -ForegroundColor Yellow
& $cloudflaredExe tunnel list 2>&1 | Select-Object -First 10

Write-Host "`n🎉 Restauration terminée!" -ForegroundColor Green
Write-Host "🌐 Accédez à votre site sur: https://iahome.fr" -ForegroundColor Cyan
Write-Host "💡 Pour vérifier le statut du tunnel, exécutez: cloudflared tunnel info iahome-new" -ForegroundColor Yellow
