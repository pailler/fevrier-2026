# Script wrapper pour démarrer StableProjectorz uniquement s'il n'est pas déjà en cours d'exécution
$scriptPath = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
$workingDir = Split-Path $scriptPath

# Vérifier si le port 8888 est déjà utilisé (service déjà démarré)
$portInUse = netstat -ano | findstr ":8888"
if ($portInUse) {
    Write-Host "[StableProjectorz] Service déjà en cours d'exécution sur le port 8888" -ForegroundColor Green
    exit 0
}

# Attendre que Windows soit complètement démarré
Start-Sleep -Seconds 30

# Vérifier à nouveau après l'attente
$portInUse = netstat -ano | findstr ":8888"
if ($portInUse) {
    Write-Host "[StableProjectorz] Service déjà en cours d'exécution" -ForegroundColor Green
    exit 0
}

# Démarrer le script
Write-Host "[StableProjectorz] Démarrage du service..." -ForegroundColor Cyan
Set-Location $workingDir
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", ""$scriptPath"" -WindowStyle Minimized
