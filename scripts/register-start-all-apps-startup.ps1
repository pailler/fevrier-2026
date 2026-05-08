# =============================================================================
# Ajoute ou retire le demarrage automatique de start-all-apps au login Windows.
# Usage (une fois) : .\scripts\register-start-all-apps-startup.ps1
#                    .\scripts\register-start-all-apps-startup.ps1 -Unregister
# =============================================================================

param(
    [switch]$Unregister,
    [string]$ShortcutName = "iahome-start-all-apps.lnk"
)

$ErrorActionPreference = "Stop"
$Launcher = Join-Path $PSScriptRoot "start-all-apps-at-login.cmd"
if (-not (Test-Path $Launcher)) {
    Write-Error "Fichier introuvable : $Launcher"
}

$StartupDir = Join-Path $env:APPDATA "Microsoft\Windows\Start Menu\Programs\Startup"
$ShortcutPath = Join-Path $StartupDir $ShortcutName

if ($Unregister) {
    if (Test-Path $ShortcutPath) {
        Remove-Item -LiteralPath $ShortcutPath -Force
        Write-Host "Raccourci retire du dossier Demarrage : $ShortcutPath" -ForegroundColor Green
    } else {
        Write-Host "Aucun raccourci a retirer : $ShortcutPath" -ForegroundColor DarkYellow
    }
    exit 0
}

if (-not (Test-Path $StartupDir)) {
    New-Item -ItemType Directory -Path $StartupDir -Force | Out-Null
}

$Wsh = New-Object -ComObject WScript.Shell
$Sc = $Wsh.CreateShortcut($ShortcutPath)
$Sc.TargetPath = $Launcher
$Sc.WorkingDirectory = (Split-Path $Launcher -Parent)
$Sc.WindowStyle = 1
$Sc.Description = "Demarre les applications iahome (start-all-apps) apres connexion Windows."
$Sc.Save()
[System.Runtime.InteropServices.Marshal]::ReleaseComObject($Wsh) | Out-Null

Write-Host "Demarrage automatique enregistre." -ForegroundColor Green
Write-Host "  Raccourci : $ShortcutPath" -ForegroundColor Cyan
Write-Host "  Lanceur   : $Launcher" -ForegroundColor Cyan
Write-Host "Pour desactiver : .\scripts\register-start-all-apps-startup.ps1 -Unregister" -ForegroundColor DarkGray
