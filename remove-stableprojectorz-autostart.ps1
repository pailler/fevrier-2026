# Script pour désactiver le démarrage automatique de Hunyuan3D Gradio
Write-Host "🛑 Désactivation du démarrage automatique de Hunyuan3D Gradio..." -ForegroundColor Cyan
Write-Host ""

$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
# Chercher les deux noms possibles (ancien et nouveau)
$shortcutNames = @("StableProjectorz - Auto Start.lnk", "Hunyuan3D Gradio - Auto Start.lnk")
$found = $false

foreach ($shortcutName in $shortcutNames) {
    $shortcutPath = Join-Path $startupFolder $shortcutName
    if (Test-Path $shortcutPath) {
        $found = $true
        try {
            Remove-Item -Path $shortcutPath -Force
            Write-Host "✅ Raccourci supprimé: $shortcutPath" -ForegroundColor Green
        } catch {
            Write-Host "❌ Erreur lors de la suppression: $_" -ForegroundColor Red
        }
    }
}

if (-not $found) {
    Write-Host "ℹ️  Aucun raccourci trouvé dans le dossier Startup" -ForegroundColor Yellow
    Write-Host "   Le démarrage automatique n'était pas configuré" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "✅ Le démarrage automatique a été désactivé" -ForegroundColor Green
    Write-Host "   Le service ne démarrera plus automatiquement au démarrage de Windows" -ForegroundColor Gray
}

Write-Host ""
exit 0

if (Test-Path $shortcutPath) {
    try {
        Remove-Item -Path $shortcutPath -Force
        Write-Host "✅ Raccourci supprimé: $shortcutPath" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ Le démarrage automatique a été désactivé" -ForegroundColor Green
        Write-Host "   Le service ne démarrera plus automatiquement au démarrage de Windows" -ForegroundColor Gray
    } catch {
        Write-Host "❌ Erreur lors de la suppression: $_" -ForegroundColor Red
    }
} else {
    Write-Host "ℹ️  Aucun raccourci trouvé dans le dossier Startup" -ForegroundColor Yellow
    Write-Host "   Le démarrage automatique n'était pas configuré" -ForegroundColor Gray
}

Write-Host ""

