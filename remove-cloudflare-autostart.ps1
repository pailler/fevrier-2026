# Script pour supprimer le démarrage automatique de Cloudflare Tunnel

Write-Host "🗑️  Suppression du démarrage automatique de Cloudflare" -ForegroundColor Cyan
Write-Host "====================================================`n" -ForegroundColor Cyan

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
if (-not $isAdmin) {
    Write-Host "⚠️  Ce script nécessite les droits administrateur." -ForegroundColor Yellow
    Write-Host "💡 Relancez PowerShell en tant qu'administrateur et réexécutez ce script." -ForegroundColor Gray
    exit 1
}

$taskName = "IAHome-Cloudflare-Tunnel"

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

# Supprimer le script de démarrage (optionnel)
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$startupScript = Join-Path $scriptDir "start-cloudflare-tunnel-auto.ps1"

if (Test-Path $startupScript) {
    Write-Host "`n2️⃣ Suppression du script de démarrage..." -ForegroundColor Yellow
    $removeScript = Read-Host "   Voulez-vous supprimer le script de démarrage ? (O/N)"
    if ($removeScript -eq "O" -or $removeScript -eq "o") {
        Remove-Item -Path $startupScript -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Script supprimé" -ForegroundColor Green
    } else {
        Write-Host "   ℹ️  Script conservé : $startupScript" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Suppression terminée!" -ForegroundColor Green
Write-Host "💡 Cloudflare ne démarrera plus automatiquement au démarrage de Windows." -ForegroundColor Yellow
Write-Host ""


