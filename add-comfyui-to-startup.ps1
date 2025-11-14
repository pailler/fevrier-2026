# Script pour ajouter ComfyUI au démarrage automatique de Windows
# Exécutez ce script en tant qu'administrateur si nécessaire

Write-Host "🚀 Ajout de ComfyUI au démarrage automatique" -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan
Write-Host ""

# Chemin du dossier de démarrage Windows
$startupFolder = [Environment]::GetFolderPath("Startup")
Write-Host "📁 Dossier de démarrage: $startupFolder" -ForegroundColor Gray
Write-Host ""

# Chemin vers le script de démarrage de ComfyUI
$scriptPath = Join-Path $PSScriptRoot "start-comfyui.ps1"
$scriptPath = Resolve-Path $scriptPath -ErrorAction SilentlyContinue

if (-not $scriptPath) {
    Write-Host "❌ Erreur: Impossible de trouver start-comfyui.ps1" -ForegroundColor Red
    Write-Host "   Chemin recherché: $PSScriptRoot\start-comfyui.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "📝 Script trouvé: $scriptPath" -ForegroundColor Gray
Write-Host ""

# Créer un fichier batch qui lance le script PowerShell
$batchFileName = "ComfyUI - Auto Start.bat"
$batchFilePath = Join-Path $startupFolder $batchFileName

try {
    # Créer le fichier batch
    $batchContent = @"
@echo off
cd /d "$PSScriptRoot"
powershell.exe -ExecutionPolicy Bypass -File "start-comfyui.ps1"
"@
    
    Set-Content -Path $batchFilePath -Value $batchContent -Encoding ASCII
    Write-Host "✅ Fichier batch créé: $batchFilePath" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de la création du fichier batch: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   Configuration terminée!" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ ComfyUI sera lancé automatiquement au prochain démarrage de Windows" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Pour désactiver le démarrage automatique:" -ForegroundColor Cyan
Write-Host "   1. Appuyez sur Win+R" -ForegroundColor Gray
Write-Host "   2. Tapez: shell:startup" -ForegroundColor Gray
Write-Host "   3. Supprimez le fichier: $batchFileName" -ForegroundColor Gray
Write-Host ""
Write-Host "📌 Note: Docker Desktop doit être configuré pour démarrer automatiquement" -ForegroundColor Yellow
Write-Host "   pour que ComfyUI puisse démarrer correctement." -ForegroundColor Yellow
Write-Host ""

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")









