# Script pour installer Home Assistant dans le dossier de demarrage Windows
# Ne necessite pas de droits administrateur

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION DEMARRAGE AUTOMATIQUE" -ForegroundColor Cyan
Write-Host "  HOME ASSISTANT (Dossier Demarrage)" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $RootPath "scripts\start-home-assistant-auto-start.ps1"

# Verifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "[ERREUR] Script introuvable: $scriptPath" -ForegroundColor Red
    exit 1
}

# Chemin du dossier de demarrage Windows
$startupFolder = [Environment]::GetFolderPath("Startup")
$shortcutPath = Join-Path $startupFolder "IAHome-HomeAssistant.lnk"

Write-Host "[1/2] Creation du raccourci dans le dossier de demarrage..." -ForegroundColor Yellow

try {
    # Creer un raccourci PowerShell
    $WScriptShell = New-Object -ComObject WScript.Shell
    $shortcut = $WScriptShell.CreateShortcut($shortcutPath)
    $shortcut.TargetPath = "powershell.exe"
    $shortcut.Arguments = "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
    $shortcut.WorkingDirectory = $RootPath
    $shortcut.Description = "Demarre automatiquement Home Assistant au demarrage de Windows"
    $shortcut.Save()
    
    Write-Host "   [OK] Raccourci cree: $shortcutPath" -ForegroundColor Green
    
} catch {
    Write-Host "   [ERREUR] Impossible de creer le raccourci: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n[2/2] Verification..." -ForegroundColor Yellow
if (Test-Path $shortcutPath) {
    Write-Host "   [OK] Raccourci installe avec succes" -ForegroundColor Green
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  DEMARRAGE AUTOMATIQUE INSTALLE" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "[INFO] Home Assistant demarrera automatiquement au prochain demarrage de Windows" -ForegroundColor Cyan
    Write-Host "   Port: 8123" -ForegroundColor Gray
    Write-Host "   URL locale: http://localhost:8123" -ForegroundColor Gray
    Write-Host "   URL production: https://homeassistant.iahome.fr" -ForegroundColor Gray
    Write-Host "   Raccourci: $shortcutPath" -ForegroundColor Gray
    
    Write-Host "`n[TEST] Pour tester maintenant:" -ForegroundColor Yellow
    Write-Host "   .\scripts\start-home-assistant-auto-start.ps1" -ForegroundColor Gray
    
    Write-Host "`n[SUPPRESSION] Pour supprimer le demarrage automatique:" -ForegroundColor Yellow
    Write-Host "   Supprimez le fichier: $shortcutPath" -ForegroundColor Gray
    
} else {
    Write-Host "   [ERREUR] Raccourci non trouve apres creation" -ForegroundColor Red
    exit 1
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
