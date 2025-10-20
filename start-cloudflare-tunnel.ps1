# Script de démarrage du tunnel Cloudflare pour iahome
# Ce script démarre le tunnel Cloudflare pour résoudre les erreurs 502

Write-Host "🌐 Démarrage du tunnel Cloudflare pour iahome..." -ForegroundColor Cyan

# Vérifier si cloudflared est installé
try {
    $cloudflaredVersion = cloudflared --version
    Write-Host "✅ Cloudflared détecté: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflared n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "💡 Installez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# Lister les tunnels disponibles
Write-Host "📋 Tunnels Cloudflare disponibles:" -ForegroundColor Yellow
cloudflared tunnel list

# Vérifier le statut du tunnel iahome-new
Write-Host "🔍 Vérification du statut du tunnel iahome-new..." -ForegroundColor Yellow
$tunnelInfo = cloudflared tunnel info iahome-new 2>&1

if ($tunnelInfo -match "does not have any active connection") {
    Write-Host "⚠️ Le tunnel iahome-new n'est pas actif" -ForegroundColor Yellow
    Write-Host "🚀 Démarrage du tunnel iahome-new..." -ForegroundColor Cyan
    
    # Démarrer le tunnel en arrière-plan
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "iahome-new" -WindowStyle Hidden
    
    # Attendre que le tunnel se connecte
    Write-Host "⏳ Attente de la connexion du tunnel..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Vérifier à nouveau le statut
    $tunnelInfoAfter = cloudflared tunnel info iahome-new 2>&1
    if ($tunnelInfoAfter -match "CONNECTOR ID") {
        Write-Host "✅ Tunnel iahome-new démarré avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du démarrage du tunnel" -ForegroundColor Red
        Write-Host "💡 Vérifiez la configuration du tunnel dans Cloudflare Dashboard" -ForegroundColor Yellow
    }
} else {
    Write-Host "✅ Le tunnel iahome-new est déjà actif" -ForegroundColor Green
}

# Tester l'accessibilité du site
Write-Host "🌐 Test d'accessibilité du site..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Site accessible via Cloudflare: https://iahome.fr" -ForegroundColor Green
        Write-Host "📊 Statut: $($response.StatusCode)" -ForegroundColor Cyan
        Write-Host "🛡️ Serveur: $($response.Headers['Server'])" -ForegroundColor Cyan
    } else {
        Write-Host "⚠️ Site répond avec le code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Site non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Vérifiez la configuration DNS dans Cloudflare Dashboard" -ForegroundColor Yellow
}

# Afficher les informations du tunnel
Write-Host "📋 Informations du tunnel:" -ForegroundColor Yellow
cloudflared tunnel info iahome-new

Write-Host "🎉 Script terminé!" -ForegroundColor Green
Write-Host "🌐 Accédez à votre site sur: https://iahome.fr" -ForegroundColor Cyan
