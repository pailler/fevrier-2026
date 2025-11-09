# Script pour ajouter Stability Matrix et Hunyuan3D-2 au démarrage automatique de Windows
# Exécutez ce script en tant qu'administrateur si nécessaire

Write-Host "🚀 Ajout de Stability Matrix et Hunyuan3D-2 au démarrage automatique" -ForegroundColor Cyan
Write-Host "=====================================================================" -ForegroundColor Cyan
Write-Host ""

# Chemin du dossier de démarrage Windows
$startupFolder = [Environment]::GetFolderPath("Startup")
Write-Host "📁 Dossier de démarrage: $startupFolder" -ForegroundColor Gray
Write-Host ""

$successCount = 0
$errorCount = 0

# ============================================================
# Ajouter Stability Matrix
# ============================================================
Write-Host "[1/2] Ajout de Stability Matrix..." -ForegroundColor Yellow

$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
$stabilityMatrixPath = Resolve-Path $stabilityMatrixPath -ErrorAction SilentlyContinue

if (-not $stabilityMatrixPath) {
    Write-Host "   ❌ Erreur: Impossible de trouver StabilityMatrix.exe" -ForegroundColor Red
    Write-Host "      Chemin recherché: $env:USERPROFILE\Documents\StabilityMatrix-win-x64\StabilityMatrix.exe" -ForegroundColor Yellow
    $errorCount++
} else {
    $shortcutName = "Stability Matrix - Auto Start.lnk"
    $shortcutPath = Join-Path $startupFolder $shortcutName
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = $stabilityMatrixPath
        $Shortcut.WorkingDirectory = Split-Path $stabilityMatrixPath
        $Shortcut.Description = "Démarrage automatique de Stability Matrix"
        $Shortcut.Save()
        
        Write-Host "   ✅ OK - Stability Matrix ajouté avec succès" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   ❌ Erreur lors de la création du raccourci: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""

# ============================================================
# Ajouter Hunyuan3D-2
# ============================================================
Write-Host "[2/2] Ajout de Hunyuan3D-2..." -ForegroundColor Yellow

$hunyuanScriptPath = Join-Path $env:USERPROFILE "Documents\iahome\v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
$hunyuanScriptPath = Resolve-Path $hunyuanScriptPath -ErrorAction SilentlyContinue

if (-not $hunyuanScriptPath) {
    Write-Host "   ❌ Erreur: Impossible de trouver le fichier .bat" -ForegroundColor Red
    Write-Host "      Chemin recherché: $env:USERPROFILE\Documents\iahome\v16_hunyuan2-stableprojectorz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Yellow
    $errorCount++
} else {
    $shortcutName = "Hunyuan3D-2 - Auto Start.lnk"
    $shortcutPath = Join-Path $startupFolder $shortcutName
    
    try {
        $WshShell = New-Object -ComObject WScript.Shell
        $Shortcut = $WshShell.CreateShortcut($shortcutPath)
        $Shortcut.TargetPath = $hunyuanScriptPath
        $Shortcut.WorkingDirectory = Split-Path $hunyuanScriptPath
        $Shortcut.Description = "Démarrage automatique de Hunyuan3D-2"
        $Shortcut.Save()
        
        Write-Host "   ✅ OK - Hunyuan3D-2 ajouté avec succès" -ForegroundColor Green
        $successCount++
    } catch {
        Write-Host "   ❌ Erreur lors de la création du raccourci: $_" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Configuration terminée!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Applications ajoutées avec succès: $successCount" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "❌ Erreurs rencontrées: $errorCount" -ForegroundColor Red
}
Write-Host ""
Write-Host "📌 Les applications se lanceront automatiquement au prochain démarrage de Windows" -ForegroundColor Yellow
Write-Host ""
Write-Host "💡 Pour désactiver le démarrage automatique:" -ForegroundColor Cyan
Write-Host "   1. Appuyez sur Win+R" -ForegroundColor Gray
Write-Host "   2. Tapez: shell:startup" -ForegroundColor Gray
Write-Host "   3. Supprimez les raccourcis correspondants" -ForegroundColor Gray
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

