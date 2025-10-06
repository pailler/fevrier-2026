# Cloudflare Tunnel Stop Script
Write-Host "Stopping Cloudflare Tunnel..." -ForegroundColor Green

# Check if cloudflared is running
$process = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($process) {
    Write-Host "Stopping cloudflared process..." -ForegroundColor Yellow
    Stop-Process -Name "cloudflared" -Force
    Write-Host "Cloudflare tunnel stopped successfully!" -ForegroundColor Green
} else {
    Write-Host "No cloudflared process found running." -ForegroundColor Yellow
}















