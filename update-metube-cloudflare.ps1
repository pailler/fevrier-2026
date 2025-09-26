Write-Host "🔧 Mise à jour de la configuration Cloudflare pour MeTube..." -ForegroundColor Yellow

# Arrêter le tunnel actuel
Write-Host "⏹️ Arrêt du tunnel Cloudflare..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force

Start-Sleep -Seconds 3

# Démarrer le tunnel avec la nouvelle configuration
Write-Host "🚀 Démarrage du tunnel avec authentification MeTube..." -ForegroundColor Green
Write-Host "Configuration:" -ForegroundColor Cyan
Write-Host "• metube.iahome.fr → http://192.168.1.150:3000 (IAHome pour auth)" -ForegroundColor Green
Write-Host "• iahome.fr → http://192.168.1.150:3000" -ForegroundColor Green
Write-Host "• qrcodes.iahome.fr → http://192.168.1.150:7005" -ForegroundColor Green
Write-Host "• librespeed.iahome.fr → http://192.168.1.150:8081" -ForegroundColor Green
Write-Host "• convert.iahome.fr → http://192.168.1.150:8196" -ForegroundColor Green

.\cloudflared.exe tunnel run iahome-new
