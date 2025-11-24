# Script pour configurer le démarrage automatique de Hunyuan3D Gradio
# Lance directement run-gradio-turbo-multiview-RECOMMENDED.bat au démarrage de Windows
Write-Host "🚀 Configuration du démarrage automatique de Hunyuan3D Gradio..." -ForegroundColor Cyan
Write-Host ""

# Chemin vers le script .bat à exécuter
$batScriptPath = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
$batScriptPath = Resolve-Path $batScriptPath -ErrorAction SilentlyContinue

if (-not $batScriptPath) {
    Write-Host "❌ Erreur: Impossible de trouver le script .bat" -ForegroundColor Red
    Write-Host "   Chemin recherché: C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Script .bat trouvé: $batScriptPath" -ForegroundColor Green
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

# Supprimer l'ancien raccourci s'il existe
if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "✅ Ancien raccourci supprimé" -ForegroundColor Green
}

# Chemin vers le script wrapper PowerShell
$wrapperScriptPath = Join-Path $PSScriptRoot "start-hunyuan3d-gradio-autostart.ps1"

# Créer le raccourci dans le dossier Startup
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$wrapperScriptPath`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Démarrage automatique de Hunyuan3D Gradio (run-gradio-turbo-multiview-RECOMMENDED.bat) au démarrage de Windows"
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
Write-Host "   • Script .bat: $batScriptPath" -ForegroundColor White
Write-Host "   • Script wrapper: $wrapperScriptPath" -ForegroundColor White
Write-Host "   • Raccourci Startup: $shortcutPath" -ForegroundColor White
Write-Host "   • Le service démarrera automatiquement au prochain démarrage de Windows" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pour tester maintenant:" -ForegroundColor Yellow
Write-Host "   .\start-hunyuan3d-gradio-autostart.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour désactiver le démarrage automatique:" -ForegroundColor Yellow
Write-Host "   Supprimez le fichier: $shortcutPath" -ForegroundColor Gray
Write-Host ""



