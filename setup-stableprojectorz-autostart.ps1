# Script pour configurer le démarrage automatique de Hunyuan3D (interface Gradio)
# Version: 1.0
Write-Host "🚀 Configuration du démarrage automatique de Hunyuan3D (interface Gradio)..." -ForegroundColor Cyan
Write-Host ""

# Chemin vers le script Gradio (interface web) à démarrer
# Priorité au script Gradio pour avoir l'interface web au lieu de l'API
$scriptPath = Join-Path $PSScriptRoot "hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
$scriptPath = Resolve-Path $scriptPath -ErrorAction SilentlyContinue

# Fallback vers l'ancienne version si la nouvelle n'existe pas
if (-not $scriptPath) {
    $scriptPath = Join-Path $PSScriptRoot "v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
    $scriptPath = Resolve-Path $scriptPath -ErrorAction SilentlyContinue
}

if (-not $scriptPath) {
    Write-Host "❌ Erreur: Impossible de trouver le script Gradio" -ForegroundColor Red
    Write-Host "   Chemins recherchés:" -ForegroundColor Yellow
    Write-Host "   - $PSScriptRoot\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Gray
    Write-Host "   - $PSScriptRoot\v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Gray
    exit 1
}

Write-Host "✅ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host ""

# Chemin du dossier de démarrage Windows
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$shortcutName = "Hunyuan3D Gradio - Auto Start.lnk"
$shortcutPath = Join-Path $startupFolder $shortcutName

# Créer le dossier Startup s'il n'existe pas
if (-not (Test-Path $startupFolder)) {
    New-Item -ItemType Directory -Path $startupFolder -Force | Out-Null
    Write-Host "✅ Dossier Startup créé" -ForegroundColor Green
}

# Créer un script PowerShell wrapper qui vérifie si le service est déjà en cours d'exécution
$wrapperScript = @"
# Script wrapper pour démarrer StableProjectorz uniquement s'il n'est pas déjà en cours d'exécution
`$scriptPath = "$scriptPath"
`$workingDir = Split-Path `$scriptPath

# Vérifier si le port 8888 est déjà utilisé (service déjà démarré)
`$portInUse = netstat -ano | findstr ":8888"
if (`$portInUse) {
    Write-Host "[StableProjectorz] Service déjà en cours d'exécution sur le port 8888" -ForegroundColor Green
    exit 0
}

# Attendre que Windows soit complètement démarré
Start-Sleep -Seconds 30

# Vérifier à nouveau après l'attente
`$portInUse = netstat -ano | findstr ":8888"
if (`$portInUse) {
    Write-Host "[StableProjectorz] Service déjà en cours d'exécution" -ForegroundColor Green
    exit 0
}

# Démarrer le script
Write-Host "[StableProjectorz] Démarrage du service..." -ForegroundColor Cyan
Set-Location `$workingDir
Start-Process -FilePath "cmd.exe" -ArgumentList "/c", "`"`$scriptPath`"" -WindowStyle Minimized
"@

$wrapperScriptPath = Join-Path $PSScriptRoot "start-stableprojectorz-autostart.ps1"
Set-Content -Path $wrapperScriptPath -Value $wrapperScript -Encoding UTF8
Write-Host "✅ Script wrapper créé: $wrapperScriptPath" -ForegroundColor Green

# Créer le raccourci dans le dossier Startup
try {
    $WshShell = New-Object -ComObject WScript.Shell
    $Shortcut = $WshShell.CreateShortcut($shortcutPath)
    $Shortcut.TargetPath = "powershell.exe"
    $Shortcut.Arguments = "-NoExit -ExecutionPolicy Bypass -File `"$wrapperScriptPath`""
    $Shortcut.WorkingDirectory = $PSScriptRoot
    $Shortcut.Description = "Démarrage automatique de Hunyuan3D (interface Gradio) au démarrage de Windows"
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
Write-Host "   • Script wrapper: $wrapperScriptPath" -ForegroundColor White
Write-Host "   • Raccourci Startup: $shortcutPath" -ForegroundColor White
Write-Host "   • Le service démarrera automatiquement au prochain démarrage de Windows" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pour tester maintenant:" -ForegroundColor Yellow
Write-Host "   .\start-stableprojectorz-autostart.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "🛑 Pour désactiver le démarrage automatique:" -ForegroundColor Yellow
Write-Host "   Supprimez le fichier: $shortcutPath" -ForegroundColor Gray
Write-Host ""

