# Script pour redémarrer Cloudflared
Write-Host "🔄 Redémarrage de Cloudflared..." -ForegroundColor Yellow

# Arrêter tous les processus cloudflared
Write-Host "⏹️ Arrêt des processus cloudflared..." -ForegroundColor Red
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Attendre un peu
Start-Sleep -Seconds 3

# Vérifier que les processus sont arrêtés
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "❌ Impossible d'arrêter tous les processus cloudflared" -ForegroundColor Red
    Write-Host "💡 Redémarrez l'ordinateur ou utilisez le gestionnaire de tâches" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Processus cloudflared arrêtés" -ForegroundColor Green

# Redémarrer le tunnel
Write-Host "🚀 Démarrage du tunnel iahome-tunnel..." -ForegroundColor Blue
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "iahome-tunnel", "--config", "cloudflared-simple.yml" -WindowStyle Hidden

# Attendre un peu
Start-Sleep -Seconds 10

# Vérifier le statut
Write-Host "🔍 Vérification du statut du tunnel..." -ForegroundColor Cyan
$tunnelInfo = cloudflared tunnel info iahome-tunnel 2>&1

if ($tunnelInfo -match "active connection") {
    Write-Host "✅ Tunnel connecté avec succès!" -ForegroundColor Green
    Write-Host "🌐 Votre site est accessible sur https://iahome.fr" -ForegroundColor Green
} else {
    Write-Host "❌ Tunnel non connecté" -ForegroundColor Red
    Write-Host "📋 Informations du tunnel:" -ForegroundColor Yellow
    Write-Host $tunnelInfo
}

Write-Host "🏁 Script terminé" -ForegroundColor Blue
