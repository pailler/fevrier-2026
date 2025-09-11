Write-Host "Redemarrage de Cloudflared..." -ForegroundColor Yellow

# Arreter les processus
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# Redemarrer
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "iahome-tunnel", "--config", "cloudflared-simple.yml" -WindowStyle Hidden
Start-Sleep -Seconds 10

# Verifier
$info = cloudflared tunnel info iahome-tunnel
Write-Host "Statut du tunnel:" -ForegroundColor Cyan
Write-Host $info
