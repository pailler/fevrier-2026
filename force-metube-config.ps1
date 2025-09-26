Write-Host "🔧 Configuration forcée de MeTube avec authentification..." -ForegroundColor Yellow
Write-Host ""

Write-Host "Configuration requise:" -ForegroundColor Cyan
Write-Host "• metube.iahome.fr → http://192.168.1.150:3000 (IAHome pour auth)" -ForegroundColor Green
Write-Host "• iahome.fr → http://192.168.1.150:3000" -ForegroundColor Green
Write-Host "• qrcodes.iahome.fr → http://192.168.1.150:7005" -ForegroundColor Green
Write-Host "• librespeed.iahome.fr → http://192.168.1.150:8081" -ForegroundColor Green
Write-Host "• convert.iahome.fr → http://192.168.1.150:8196" -ForegroundColor Green
Write-Host ""

Write-Host "🚀 Démarrage de Cloudflare avec configuration forcée..." -ForegroundColor Green
Write-Host "L'utilisateur devra s'identifier avant d'accéder à MeTube" -ForegroundColor Cyan

# Démarrer le tunnel avec la configuration forcée
.\cloudflared.exe tunnel --config cloudflare-config-metube.yml run
