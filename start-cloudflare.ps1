# Cloudflare Tunnel Startup Script
Write-Host "Starting Cloudflare Tunnel..." -ForegroundColor Green

# Check if cloudflared is running
$process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "Cloudflared is already running. Stopping existing process..." -ForegroundColor Yellow
    Stop-Process -Name "cloudflared" -Force
    Start-Sleep -Seconds 2
}

# Start the tunnel with the complete configuration
Write-Host "Starting tunnel with complete configuration..." -ForegroundColor Green
Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-complete-config.yml", "run" -WindowStyle Minimized

Write-Host "Cloudflare tunnel started successfully!" -ForegroundColor Green
Write-Host "You can test the routes using: .\test-cloudflare-routes.ps1" -ForegroundColor Cyan










