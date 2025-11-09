# Script pour retirer StableDiffusion du démarrage automatique de Windows

Write-Host "🛑 Retrait de StableDiffusion du démarrage automatique" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan
Write-Host ""

# Chemin du dossier de démarrage Windows
$startupFolder = [Environment]::GetFolderPath("Startup")
Write-Host "📁 Dossier de démarrage: $startupFolder" -ForegroundColor Gray
Write-Host ""

# Nom du fichier batch à supprimer
$batchFileName = "StableDiffusion - Auto Start.bat"
$batchFilePath = Join-Path $startupFolder $batchFileName

if (Test-Path $batchFilePath) {
    try {
        Remove-Item -Path $batchFilePath -Force
        Write-Host "✅ Fichier supprimé: $batchFileName" -ForegroundColor Green
        Write-Host ""
        Write-Host "✅ StableDiffusion ne sera plus lancé automatiquement au démarrage de Windows" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors de la suppression du fichier: $_" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⚠️  Fichier non trouvé: $batchFileName" -ForegroundColor Yellow
    Write-Host "   StableDiffusion n'était peut-être pas configuré pour le démarrage automatique" -ForegroundColor Gray
}

Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

