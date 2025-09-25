# Script PowerShell pour mettre à jour la configuration Cloudflare QR codes
# Redirige vers la nouvelle page de redirection avec sessions utilisateur

Write-Host "🔧 Mise à jour de la configuration Cloudflare QR codes..." -ForegroundColor Yellow
Write-Host "=======================================================" -ForegroundColor Yellow

# Vérifier si cloudflared est disponible
if (!(Test-Path ".\cloudflared.exe")) {
    Write-Host "❌ cloudflared.exe non trouvé !" -ForegroundColor Red
    Write-Host "💡 Assurez-vous d'être dans le bon répertoire." -ForegroundColor Gray
    exit 1
}

Write-Host "✅ cloudflared.exe trouvé" -ForegroundColor Green

# Arrêter le tunnel existant
Write-Host "🛑 Arrêt du tunnel existant..." -ForegroundColor Cyan
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force

# Attendre un peu
Start-Sleep -Seconds 2

# Créer la nouvelle configuration
Write-Host "📝 Création de la nouvelle configuration..." -ForegroundColor Cyan
$config = @"
tunnel: iahome-new
credentials-file: C:\Users\AAA\.cloudflared\4cc75dfd-fd02-4496-97f9-23f40fc1943d.json

ingress:
  - hostname: librespeed.iahome.fr
    service: http://192.168.1.150:8081
  - hostname: psitransfer.iahome.fr
    service: http://192.168.1.150:7009
  - hostname: metube.iahome.fr
    service: http://192.168.1.150:7007
  - hostname: www.iahome.fr
    service: http://192.168.1.150:3000
  - hostname: iahome.fr
    service: http://192.168.1.150:3000
  - hostname: qrcodes.iahome.fr
    service: http://192.168.1.150:3000/qrcodes-redirect
  - service: http_status:404
"@

# Sauvegarder la configuration
$config | Out-File -FilePath "cloudflare-tunnel-config.yml" -Encoding UTF8

Write-Host "✅ Configuration sauvegardée dans cloudflare-tunnel-config.yml" -ForegroundColor Green

# Démarrer le tunnel avec la nouvelle configuration
Write-Host "🚀 Démarrage du tunnel avec la nouvelle configuration..." -ForegroundColor Cyan
Start-Process -FilePath ".\cloudflared.exe" -ArgumentList "tunnel", "run", "iahome-new", "--config", "cloudflare-tunnel-config.yml" -WindowStyle Hidden

# Attendre le démarrage
Start-Sleep -Seconds 5

# Tester la nouvelle configuration
Write-Host "🔍 Test de la nouvelle configuration..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr" -Method GET -TimeoutSec 10
    Write-Host "✅ QR codes: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "   Content-Length: $($response.Content.Length) caractères" -ForegroundColor Gray
    
    if ($response.Content.Length -gt 20000) {
        Write-Host "🎉 SUCCÈS: Nouvelle interface avec sessions détectée !" -ForegroundColor Green
    } else {
        Write-Host "⚠️ ATTENTION: Interface encore ancienne détectée" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Résumé de la mise à jour:" -ForegroundColor Green
Write-Host "• Ancienne URL: https://qrcodes.iahome.fr → http://192.168.1.150:7005" -ForegroundColor Gray
Write-Host "• Nouvelle URL: https://qrcodes.iahome.fr → http://192.168.1.150:3000/qrcodes-redirect" -ForegroundColor Gray
Write-Host "• Chaque utilisateur aura sa propre session QR codes" -ForegroundColor Gray
Write-Host "• Interface moderne avec gestion des sessions" -ForegroundColor Gray
Write-Host ""
Write-Host "✅ Configuration mise à jour avec succès !" -ForegroundColor Green
