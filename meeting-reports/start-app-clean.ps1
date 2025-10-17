# Script de démarrage propre de l'application Meeting Reports
Write-Host "🚀 Démarrage propre de l'application Meeting Reports..." -ForegroundColor Green

# 1. Arrêter tous les processus Node
Write-Host "⏹️ Arrêt des processus Node existants..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*node*" -or $_.ProcessName -like "*npm*" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 3

# 2. Nettoyer les caches
Write-Host "🧹 Nettoyage des caches..." -ForegroundColor Cyan
Set-Location "C:\Users\AAA\Documents\iahome\meeting-reports\frontend"
Remove-Item -Path "build" -Recurse -Force -ErrorAction SilentlyContinue

# 3. Définir les variables d'environnement
Write-Host "⚙️ Configuration des variables d'environnement..." -ForegroundColor Cyan
$env:PORT = "3001"
$env:HOST = "0.0.0.0"
$env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
$env:REACT_APP_API_URL = "http://localhost:8001"

Write-Host "Configuration:" -ForegroundColor White
Write-Host "  PORT: $env:PORT" -ForegroundColor White
Write-Host "  HOST: $env:HOST" -ForegroundColor White
Write-Host "  API_URL: $env:REACT_APP_API_URL" -ForegroundColor White

# 4. Démarrer l'application
Write-Host "▶️ Démarrage de l'application..." -ForegroundColor Green
npm start
