# Script de reinstallation avec elevation automatique des droits
# Ce script peut etre execute sans droits admin - il demande automatiquement

$ErrorActionPreference = "Stop"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n========================================" -ForegroundColor Yellow
    Write-Host "  ELEVATION DES DROITS NECESSAIRE" -ForegroundColor Yellow
    Write-Host "========================================`n" -ForegroundColor Yellow
    
    Write-Host "Ce script necessite les droits administrateur." -ForegroundColor White
    Write-Host "Une fenetre va s'ouvrir pour demander l'autorisation..." -ForegroundColor White
    Write-Host "Cliquez sur 'Oui' dans la fenetre UAC.`n" -ForegroundColor Yellow
    
    Start-Sleep -Seconds 2
    
    # Obtenir le chemin complet du script principal
    $scriptPath = Join-Path $PSScriptRoot "reinstall-cloudflare-complete.ps1"
    
    # Relancer avec elevation
    try {
        Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$scriptPath`"" -Verb RunAs -Wait
        exit
    } catch {
        Write-Host "[ERREUR] Impossible d'obtenir les droits administrateur" -ForegroundColor Red
        Write-Host "         Message: $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "`n[SOLUTION] Executez manuellement:" -ForegroundColor Yellow
        Write-Host "   1. Clic droit sur PowerShell" -ForegroundColor Gray
        Write-Host "   2. Selectionner 'Executer en tant qu'administrateur'" -ForegroundColor Gray
        Write-Host "   3. Executer: .\scripts\reinstall-cloudflare-complete.ps1" -ForegroundColor Gray
        Write-Host "`nAppuyez sur une touche pour quitter..."
        $null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
        exit 1
    }
} else {
    # On a les droits admin, executer directement le script principal
    $scriptPath = Join-Path $PSScriptRoot "reinstall-cloudflare-complete.ps1"
    & $scriptPath
}














