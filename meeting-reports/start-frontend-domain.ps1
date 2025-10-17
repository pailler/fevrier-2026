# Script pour démarrer le frontend avec support des domaines externes
Write-Host "🚀 Démarrage du frontend avec support des domaines externes..." -ForegroundColor Green

# Arrêter les processus existants sur le port 3001
Write-Host "🛑 Arrêt des processus existants sur le port 3001..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess
if ($processes) {
    foreach ($pid in $processes) {
        try {
            Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
            Write-Host "✅ Processus $pid arrêté" -ForegroundColor Green
        } catch {
            Write-Host "⚠️  Impossible d'arrêter le processus $pid" -ForegroundColor Yellow
        }
    }
}

# Attendre un peu
Start-Sleep -Seconds 2

# Se déplacer dans le répertoire frontend
Set-Location "frontend"

# Définir les variables d'environnement
$env:PORT = "3001"
$env:HOST = "0.0.0.0"
$env:DANGEROUSLY_DISABLE_HOST_CHECK = "true"
$env:REACT_APP_API_URL = "https://meeting-reports.iahome.fr/api"

Write-Host "🔧 Configuration:" -ForegroundColor Cyan
Write-Host "   Port: $env:PORT" -ForegroundColor White
Write-Host "   Host: $env:HOST" -ForegroundColor White
Write-Host "   Host Check: $env:DANGEROUSLY_DISABLE_HOST_CHECK" -ForegroundColor White
Write-Host "   API URL: $env:REACT_APP_API_URL" -ForegroundColor White

# Démarrer le serveur de développement
Write-Host "🌐 Démarrage du serveur de développement React..." -ForegroundColor Green
Write-Host "   Accès local: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   Accès domaine: https://meeting-reports.iahome.fr" -ForegroundColor Cyan

npm start

