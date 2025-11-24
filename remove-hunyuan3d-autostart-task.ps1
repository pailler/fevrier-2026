# Script pour supprimer le démarrage automatique de Hunyuan3D Gradio

Write-Host "🗑️  Suppression du démarrage automatique de Hunyuan3D Gradio" -ForegroundColor Cyan
Write-Host ""

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Ce script nécessite les droits administrateur." -ForegroundColor Yellow
    Write-Host "💡 Relancez PowerShell en tant qu'administrateur et réexécutez ce script." -ForegroundColor Gray
    exit 1
}

$taskName = "IAHome-Hunyuan3D-Gradio"

# Vérifier si la tâche existe
Write-Host "1️⃣ Vérification de la tâche planifiée..." -ForegroundColor Yellow
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue

if ($task) {
    Write-Host "   ✅ Tâche trouvée : $taskName" -ForegroundColor Green
    Write-Host "   🗑️  Suppression de la tâche..." -ForegroundColor Gray
    
    try {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction Stop
        Write-Host "   ✅ Tâche supprimée avec succès!" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur lors de la suppression : $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ℹ️  Aucune tâche trouvée avec le nom : $taskName" -ForegroundColor Gray
}

# Supprimer aussi le raccourci dans Startup si présent
$startupFolder = "$env:APPDATA\Microsoft\Windows\Start Menu\Programs\Startup"
$shortcutNames = @("StableProjectorz - Auto Start.lnk", "Hunyuan3D Gradio - Auto Start.lnk")
$foundShortcut = $false

foreach ($shortcutName in $shortcutNames) {
    $shortcutPath = Join-Path $startupFolder $shortcutName
    if (Test-Path $shortcutPath) {
        try {
            Remove-Item -Path $shortcutPath -Force
            Write-Host "   ✅ Raccourci supprimé : $shortcutName" -ForegroundColor Green
            $foundShortcut = $true
        } catch {
            Write-Host "   ⚠️  Erreur lors de la suppression du raccourci : $_" -ForegroundColor Yellow
        }
    }
}

if (-not $foundShortcut) {
    Write-Host "   ℹ️  Aucun raccourci trouvé dans le dossier Startup" -ForegroundColor Gray
}

Write-Host ""
Write-Host "✅ Le démarrage automatique a été désactivé" -ForegroundColor Green
Write-Host ""


