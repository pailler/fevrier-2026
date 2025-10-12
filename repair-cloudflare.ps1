# Cloudflare Repair Script
Write-Host "Repairing Cloudflare Tunnel..." -ForegroundColor Green

# 1. Stop all cloudflared processes
Write-Host "Stopping all cloudflared processes..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
    try {
        Stop-Process -Id $_.Id -Force -ErrorAction Stop
        Write-Host "Stopped process $($_.Id)" -ForegroundColor Green
    } catch {
        Write-Host "Could not stop process $($_.Id): $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 2. Wait a moment
Start-Sleep -Seconds 3

# 3. Check if cloudflared is still running
$remaining = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($remaining) {
    Write-Host "Some cloudflared processes are still running. Trying alternative method..." -ForegroundColor Yellow
    
    # Try to kill with taskkill
    try {
        & taskkill /f /im cloudflared.exe
        Write-Host "Used taskkill to stop cloudflared" -ForegroundColor Green
    } catch {
        Write-Host "taskkill failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Wait again
Start-Sleep -Seconds 2

# 5. Verify all processes are stopped
$finalCheck = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($finalCheck) {
    Write-Host "WARNING: Some cloudflared processes are still running:" -ForegroundColor Red
    $finalCheck | ForEach-Object { Write-Host "  PID: $($_.Id)" -ForegroundColor Red }
} else {
    Write-Host "All cloudflared processes stopped successfully!" -ForegroundColor Green
}

# 6. Start cloudflared with the complete configuration
Write-Host "Starting cloudflared with complete configuration..." -ForegroundColor Green
try {
    Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "--config", "cloudflare-complete-config.yml", "run" -WindowStyle Minimized
    Write-Host "Cloudflared started successfully!" -ForegroundColor Green
    
    # Wait a moment for it to start
    Start-Sleep -Seconds 5
    
    # Test the connection
    Write-Host "Testing connection..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 10 -ErrorAction Stop
        Write-Host "Connection test successful! Status: $($response.StatusCode)" -ForegroundColor Green
    } catch {
        Write-Host "Connection test failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Cloudflare may still be starting up. Please wait a few minutes and test manually." -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "Failed to start cloudflared: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Cloudflare repair completed!" -ForegroundColor Green
