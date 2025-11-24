# Script pour redémarrer le conteneur Deemix
# Usage: .\restart-deemix.ps1

Write-Host "🔄 Redémarrage de Deemix..." -ForegroundColor Cyan

# Aller dans le répertoire deemix
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Arrêter puis redémarrer
Write-Host "`n📋 Arrêt du conteneur..." -ForegroundColor Yellow
& "$scriptPath\stop-deemix.ps1"

Start-Sleep -Seconds 2

Write-Host "`n📋 Démarrage du conteneur..." -ForegroundColor Yellow
& "$scriptPath\start-deemix.ps1"


