# Script de démarrage avec correction Cloudflare
Write-Host "🔧 Démarrage avec correction Cloudflare..." -ForegroundColor Green

# 1. Arrêter tous les processus
Write-Host "⏹️ Arrêt des processus existants..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*python*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 2. Démarrer le backend
Write-Host "🚀 Démarrage du backend..." -ForegroundColor Cyan
Set-Location "C:\Users\AAA\Documents\iahome\meeting-reports\backend"
Start-Process -FilePath "python.exe" -ArgumentList "main-simple-working.py" -NoNewWindow -PassThru | Out-Null
Start-Sleep -Seconds 5

# 3. Démarrer le frontend avec configuration corrigée
Write-Host "🌐 Démarrage du frontend..." -ForegroundColor Cyan
Set-Location "C:\Users\AAA\Documents\iahome\meeting-reports\frontend"

# Configuration des variables d'environnement
$env:PORT = "3001"
$env:HOST = "localhost"
$env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
$env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"
$env:PUBLIC_URL = "https://meeting-reports.iahome.fr"

Write-Host "Configuration:" -ForegroundColor White
Write-Host "  PORT: $env:PORT" -ForegroundColor White
Write-Host "  HOST: $env:HOST" -ForegroundColor White
Write-Host "  API_URL: $env:REACT_APP_API_URL" -ForegroundColor White
Write-Host "  PUBLIC_URL: $env:PUBLIC_URL" -ForegroundColor White

# Démarrer React
Start-Process -FilePath "npm" -ArgumentList "start" -NoNewWindow -PassThru | Out-Null

Write-Host "✅ Services démarrés!" -ForegroundColor Green
Write-Host "🌐 Frontend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Production: https://meeting-reports.iahome.fr" -ForegroundColor Cyan
Write-Host "🔧 API: http://localhost:8001" -ForegroundColor Cyan

# Attendre et tester
Start-Sleep -Seconds 15
Write-Host "🧪 Test des services..." -ForegroundColor Yellow

try {
    $frontendTest = Invoke-WebRequest -Uri "http://localhost:3001" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Frontend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Frontend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $backendTest = Invoke-WebRequest -Uri "http://localhost:8001/health" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Backend accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "🎉 Démarrage terminé!" -ForegroundColor Green
