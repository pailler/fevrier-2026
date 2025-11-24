# Script wrapper pour démarrer Hunyuan3D Gradio au démarrage de Windows
# Lance directement run-gradio-turbo-multiview-RECOMMENDED.bat

$scriptPath = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
$workingDir = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)"

# Vérifier si le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "[Hunyuan3D Gradio] Erreur: Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

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
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"$scriptPath`"" -WorkingDirectory $workingDir -WindowStyle Minimized



