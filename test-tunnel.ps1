# Script de test du tunnel temporaire Cloudflared
# Compatible Windows PowerShell

Write-Host "🧪 Test du tunnel temporaire Cloudflared..." -ForegroundColor Green

# Arrêter le processus cloudflared existant dans le container
Write-Host "🛑 Arrêt du processus cloudflared existant..." -ForegroundColor Yellow
docker exec iahome-app pkill cloudflared

# Démarrer un nouveau tunnel temporaire
Write-Host "📡 Démarrage d'un nouveau tunnel temporaire..." -ForegroundColor Yellow
Write-Host "⏳ Attente de l'URL du tunnel..." -ForegroundColor Cyan

# Démarrer cloudflared en arrière-plan et capturer l'URL
$job = Start-Job -ScriptBlock {
    docker exec iahome-app cloudflared tunnel --url http://localhost:3000
}

# Attendre quelques secondes pour que l'URL soit générée
Start-Sleep -Seconds 15

# Récupérer la sortie
$output = Receive-Job $job -ErrorAction SilentlyContinue
Stop-Job $job
Remove-Job $job

# Extraire l'URL du tunnel
if ($output -match "https://[a-zA-Z0-9-]+\.trycloudflare\.com") {
    $tunnelUrl = $matches[0]
    Write-Host "✅ Tunnel temporaire créé !" -ForegroundColor Green
    Write-Host "🌐 URL du tunnel: $tunnelUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📋 Pour tester l'application:" -ForegroundColor Yellow
    Write-Host "   $tunnelUrl" -ForegroundColor White
    Write-Host "   $tunnelUrl/card/librespeed" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  Note: Cette URL est temporaire et changera à chaque redémarrage" -ForegroundColor Yellow
    Write-Host "🌐 Pour une URL permanente, configurez un tunnel nommé avec:" -ForegroundColor Yellow
    Write-Host "   .\setup-cloudflared-tunnel.ps1" -ForegroundColor White
} else {
    Write-Host "❌ Impossible de récupérer l'URL du tunnel" -ForegroundColor Red
    Write-Host "📋 Sortie de cloudflared:" -ForegroundColor Yellow
    Write-Host $output -ForegroundColor Gray
}








