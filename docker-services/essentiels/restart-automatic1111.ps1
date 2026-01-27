# Script pour redémarrer Automatic1111 (Stable Diffusion WebUI)
Write-Host "Redémarrage d'Automatic1111..." -ForegroundColor Yellow

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$stopScript = Join-Path $scriptDir "stop-automatic1111.ps1"
$startScript = Join-Path $scriptDir "start-automatic1111.ps1"

# Arrêter Automatic1111
Write-Host "`n1. Arrêt d'Automatic1111..." -ForegroundColor Yellow
& $stopScript

# Attendre quelques secondes
Write-Host "`n2. Attente de 3 secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Démarrer Automatic1111
Write-Host "`n3. Démarrage d'Automatic1111..." -ForegroundColor Yellow
& $startScript
