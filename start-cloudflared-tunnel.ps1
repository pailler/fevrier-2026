# Script pour démarrer le tunnel Cloudflared avec token
Write-Host "🚀 Démarrage du tunnel Cloudflared..." -ForegroundColor Green

# Arrêter les tunnels existants
Write-Host "🛑 Arrêt des tunnels existants..." -ForegroundColor Yellow
try {
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
    Write-Host "✅ Tunnels existants arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun tunnel existant à arrêter" -ForegroundColor Gray
}

# Démarrer le tunnel avec le token
Write-Host "🌐 Démarrage du tunnel avec token..." -ForegroundColor Yellow
$token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiYjE5MDg0ZjQtZTJkNi00N2Y1LTgxYzMtMDk3MjY2MmU5NTNjIiwicyI6IlkyVm1OalJpT0RZdFpERmlNUzAwTURSaUxXSmhPVFV0WXpWaFlqRTBNakppWVdSbSJ9"

# Démarrer le tunnel en arrière-plan
Start-Process -FilePath "docker" -ArgumentList "run", "--rm", "-d", "--name", "cloudflared-tunnel", "cloudflare/cloudflared:latest", "tunnel", "--no-autoupdate", "run", "--token", $token -WindowStyle Hidden

Write-Host "✅ Tunnel Cloudflared démarré en arrière-plan" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Services accessibles via Cloudflare:" -ForegroundColor Cyan
Write-Host "   - IAHome: https://iahome.fr" -ForegroundColor White
Write-Host "   - LibreSpeed: https://librespeed.regispailler.fr" -ForegroundColor White
Write-Host "   - PDF: https://pdf.regispailler.fr" -ForegroundColor White
Write-Host "   - MeTube: https://metube.regispailler.fr" -ForegroundColor White
Write-Host "   - PsiTransfer: https://psitransfer.regispailler.fr" -ForegroundColor White
Write-Host "   - QR Code: https://qrcode.regispailler.fr" -ForegroundColor White
Write-Host ""
Write-Host "📊 Vérification du statut:" -ForegroundColor Yellow
Write-Host "   docker logs cloudflared-tunnel" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour arrêter le tunnel:" -ForegroundColor Yellow
Write-Host "   docker stop cloudflared-tunnel" -ForegroundColor Gray
