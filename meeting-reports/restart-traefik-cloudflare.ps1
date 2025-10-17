# Script pour redémarrer Traefik avec configuration Cloudflare
Write-Host "🔄 Redémarrage de Traefik avec configuration Cloudflare..." -ForegroundColor Green

# 1. Copier les configurations mises à jour
Write-Host "📋 Copie des configurations Traefik..." -ForegroundColor Cyan
Copy-Item -Path ".\traefik-meeting-reports.yml" -Destination "C:\Users\AAA\Documents\iahome\traefik\dynamic\" -Force
Copy-Item -Path ".\traefik-meeting-reports-api.yml" -Destination "C:\Users\AAA\Documents\iahome\traefik\dynamic\" -Force
Write-Host "✅ Configurations copiées" -ForegroundColor Green

# 2. Redémarrer Traefik
Write-Host "🔄 Redémarrage de Traefik..." -ForegroundColor Yellow

# Arrêter Traefik s'il est en cours
$traefikProcesses = Get-Process | Where-Object { $_.ProcessName -like "*traefik*" }
if ($traefikProcesses) {
    Write-Host "⏹️ Arrêt de Traefik..." -ForegroundColor Yellow
    $traefikProcesses | Stop-Process -Force
    Start-Sleep -Seconds 3
}

# Démarrer Traefik
Write-Host "▶️ Démarrage de Traefik..." -ForegroundColor Cyan
Set-Location "C:\Users\AAA\Documents\iahome\traefik"
Start-Process -FilePath "traefik.exe" -ArgumentList "--configfile=traefik.yml" -NoNewWindow -PassThru | Out-Null

Write-Host "✅ Traefik redémarré" -ForegroundColor Green

# 3. Attendre et tester
Start-Sleep -Seconds 10
Write-Host "🧪 Test de la configuration..." -ForegroundColor Yellow

try {
    $testResponse = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Domaine accessible: $($testResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Domaine non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $apiTestResponse = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr/api/health" -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ API accessible: $($apiTestResponse.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ API non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Configuration Cloudflare terminée!" -ForegroundColor Green
