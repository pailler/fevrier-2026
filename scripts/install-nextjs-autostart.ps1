# Script pour installer le demarrage automatique de Next.js au demarrage de Windows

$ErrorActionPreference = "Continue"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script necessite les droits administrateur" -ForegroundColor Red
    Write-Host "Relance avec elevation des droits..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION DEMARRAGE AUTOMATIQUE" -ForegroundColor Cyan
Write-Host "  APPLICATION NEXT.JS" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$scriptPath = Join-Path $RootPath "scripts\start-nextjs-auto-start.ps1"
$taskName = "IAHome-NextJS"

# Verifier que le script existe
if (-not (Test-Path $scriptPath)) {
    Write-Host "[ERREUR] Script introuvable: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "[1/3] Suppression de l'ancienne tache si elle existe..." -ForegroundColor Yellow
$existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($existingTask) {
    Unregister-ScheduledTask -TaskName $taskName -Confirm:$false -ErrorAction SilentlyContinue
    Write-Host "   [OK] Ancienne tache supprimee" -ForegroundColor Green
} else {
    Write-Host "   [OK] Aucune ancienne tache" -ForegroundColor Green
}

Write-Host "`n[2/3] Creation de la tache planifiee..." -ForegroundColor Yellow

try {
    # Action: Executer le script PowerShell
    $action = New-ScheduledTaskAction `
        -Execute "powershell.exe" `
        -Argument "-NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$scriptPath`""
    
    # Trigger: Au demarrage de Windows
    $trigger = New-ScheduledTaskTrigger -AtStartup
    
    # Principal: Executer en tant qu'utilisateur actuel avec droits eleves
    $principal = New-ScheduledTaskPrincipal `
        -UserId "$env:USERDOMAIN\$env:USERNAME" `
        -LogonType Interactive `
        -RunLevel Highest
    
    # Settings: Demarrer meme sur batterie, ne pas arreter si sur batterie
    $settings = New-ScheduledTaskSettingsSet `
        -AllowStartIfOnBatteries `
        -DontStopIfGoingOnBatteries `
        -StartWhenAvailable `
        -RunOnlyIfNetworkAvailable `
        -RestartCount 3 `
        -RestartInterval (New-TimeSpan -Minutes 1)
    
    # Description
    $description = "Demarre automatiquement l'application Next.js (iahome.fr) au demarrage de Windows sur le port 3000"
    
    # Enregistrer la tache
    Register-ScheduledTask `
        -TaskName $taskName `
        -Action $action `
        -Trigger $trigger `
        -Principal $principal `
        -Settings $settings `
        -Description $description `
        -ErrorAction Stop
    
    Write-Host "   [OK] Tache planifiee creee" -ForegroundColor Green
    
} catch {
    Write-Host "   [ERREUR] Impossible de creer la tache: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n[3/3] Verification..." -ForegroundColor Yellow
$task = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
if ($task) {
    Write-Host "   [OK] Tache planifiee installee avec succes" -ForegroundColor Green
    Write-Host "   Nom: $taskName" -ForegroundColor White
    Write-Host "   Statut: $($task.State)" -ForegroundColor White
    Write-Host "   Script: $scriptPath" -ForegroundColor White
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  DEMARRAGE AUTOMATIQUE INSTALLE" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
    Write-Host "[INFO] L'application Next.js demarrera automatiquement au prochain demarrage de Windows" -ForegroundColor Cyan
    Write-Host "   Port: 3000" -ForegroundColor Gray
    Write-Host "   URL locale: http://localhost:3000" -ForegroundColor Gray
    Write-Host "   URL production: https://iahome.fr" -ForegroundColor Gray
    
    Write-Host "`n[TEST] Pour tester maintenant:" -ForegroundColor Yellow
    Write-Host "   .\scripts\start-nextjs-auto-start.ps1" -ForegroundColor Gray
    
} else {
    Write-Host "   [ERREUR] Tache non trouvee apres creation" -ForegroundColor Red
    exit 1
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














