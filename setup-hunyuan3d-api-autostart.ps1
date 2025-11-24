# Script pour configurer le démarrage automatique de Hunyuan3D (Interface Gradio)
# Version: 2.0 - Interface Gradio
Write-Host "🚀 Configuration du démarrage automatique de Hunyuan3D (Interface Gradio)..." -ForegroundColor Cyan
Write-Host ""

# Chemin vers le script PowerShell de démarrage
$scriptPath = Join-Path $PSScriptRoot "start-hunyuan3d-api.ps1"
$scriptPath = Resolve-Path $scriptPath -ErrorAction SilentlyContinue

if (-not $scriptPath) {
    Write-Host "❌ Erreur: Impossible de trouver start-hunyuan3d-api.ps1" -ForegroundColor Red
    Write-Host "   Chemin recherché: $PSScriptRoot\start-hunyuan3d-api.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Chemin du dossier de démarrage Windows
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutName = "Hunyuan3D Gradio - Auto Start.lnk"
$shortcutPath = Join-Path $startupFolder $shortcutName

# Créer le dossier Startup s'il n'existe pas
if (-not (Test-Path $startupFolder)) {
    New-Item -ItemType Directory -Path $startupFolder -Force | Out-Null
    Write-Host "✅ Dossier Startup créé" -ForegroundColor Green
}

# Supprimer l'ancien raccourci s'il existe (Gradio)
$oldShortcut = Join-Path $startupFolder "Hunyuan3D Gradio - Auto Start.lnk"
if (Test-Path $oldShortcut) {
    Remove-Item $oldShortcut -Force
    Write-Host "✅ Ancien raccourci Gradio supprimé" -ForegroundColor Green
}

# Créer un script PowerShell wrapper qui vérifie si le service est déjà en cours d'exécution
$wrapperScript = @"
# Script wrapper pour démarrer Hunyuan3D (Interface Gradio) uniquement s'il n'est pas déjà en cours d'exécution
`$scriptPath = "$scriptPath"
`$workingDir = Split-Path `$scriptPath

# Vérifier si le port 8888 est déjà utilisé (service déjà démarré)
`$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if (`$portInUse) {
    Write-Host "[Hunyuan3D Gradio] Service déjà en cours d'exécution sur le port 8888" -ForegroundColor Green
    exit 0
}

# Attendre que Windows soit complètement démarré
Start-Sleep -Seconds 30

# Vérifier à nouveau après l'attente
`$portInUse = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue
if (`$portInUse) {
    Write-Host "[Hunyuan3D Gradio] Service déjà en cours d'exécution" -ForegroundColor Green
    exit 0
}

# Démarrer le script
Write-Host "[Hunyuan3D Gradio] Démarrage du service..." -ForegroundColor Cyan
Set-Location `$workingDir
& `$scriptPath
"@

$wrapperScriptPath = Join-Path $PSScriptRoot "start-hunyuan3d-api-autostart.ps1"
Set-Content -Path $wrapperScriptPath -Value $wrapperScript -Encoding UTF8
Write-Host "✅ Script wrapper créé: $wrapperScriptPath" -ForegroundColor Green

# Créer le raccourci dans le dossier Startup
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$wrapperScriptPath`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Démarrage automatique de Hunyuan3D (Interface Gradio) au démarrage de Windows"
    $Shortcut.WindowStyle = 7  # Minimized
    $Shortcut.Save()
    
    Write-Host "✅ Raccourci créé dans le dossier Startup" -ForegroundColor Green
    Write-Host "   Chemin: $shortcutPath" -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors de la création du raccourci: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "✅ Configuration terminée avec succès!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Résumé:" -ForegroundColor Cyan
Write-Host "   • Script de démarrage: $scriptPath" -ForegroundColor White
Write-Host "   • Script wrapper: $wrapperScriptPath" -ForegroundColor White
Write-Host "   • Raccourci Startup: $shortcutPath" -ForegroundColor White
Write-Host "   • Le service démarrera automatiquement au prochain démarrage de Windows" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pour tester maintenant:" -ForegroundColor Yellow
Write-Host "   .\start-hunyuan3d-api.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour désactiver le démarrage automatique:" -ForegroundColor Yellow
Write-Host "   Supprimez le fichier: $shortcutPath" -ForegroundColor Gray
Write-Host ""

