# Script wrapper pour démarrer Hunyuan3D (Interface Gradio) uniquement s'il n'est pas déjà en cours d'exécution
$scriptPath = "C:\Users\AAA\Documents\iahome\start-hunyuan3d-api.ps1"
$workingDir = Split-Path $scriptPath

# Vérifier si le port 8888 est déjà utilisé (service déjà démarré)
$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "[Hunyuan3D Gradio] Service déjà en cours d'exécution sur le port 8888" -ForegroundColor Green
    exit 0
}

# Attendre que Windows soit complètement démarré
Start-Sleep -Seconds 30

# Vérifier à nouveau après l'attente
$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if ($portInUse) {
    Write-Host "[Hunyuan3D Gradio] Service déjà en cours d'exécution" -ForegroundColor Green
    exit 0
}

# Démarrer le script
Write-Host "[Hunyuan3D Gradio] Démarrage du service..." -ForegroundColor Cyan
Set-Location $workingDir
& $scriptPath
