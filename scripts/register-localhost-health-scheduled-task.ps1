<#
.SYNOPSIS
  Enregistre une tâche planifiée Windows : test de http://localhost:3000/api/version 2 fois par jour ; email Resend si échec.

.DESCRIPTION
  Destinataire par défaut : formateur_tic@hotmail.com (variable MONITOR_ALERT_EMAIL dans .env.local).
  Nécessite : Node en PATH, RESEND_API_KEY dans .env.local, exécution depuis le dépôt IA Home.

.PARAMETER ProjectRoot
  Racine du projet (défaut : parent du dossier scripts).

.PARAMETER MorningTime
  Heure du premier contrôle (format local, ex. 08:00).

.PARAMETER EveningTime
  Heure du second contrôle (ex. 20:00).

.PARAMETER TaskName
  Nom de la tâche dans le Planificateur de tâches.
#>
param(
  [string]$ProjectRoot = "",
  [string]$MorningTime = "08:00",
  [string]$EveningTime = "20:00",
  [string]$TaskName = "IAHome-Localhost-Health"
)

$ErrorActionPreference = "Stop"

if (-not $ProjectRoot) {
  $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
} else {
  $ProjectRoot = (Resolve-Path $ProjectRoot).Path
}

$scriptPath = Join-Path $ProjectRoot "scripts\monitor-localhost.js"
if (-not (Test-Path $scriptPath)) {
  throw "Script introuvable : $scriptPath"
}

$node = (Get-Command node -ErrorAction Stop).Source

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

$action = New-ScheduledTaskAction `
  -Execute $node `
  -Argument "`"$scriptPath`" --once" `
  -WorkingDirectory $ProjectRoot

$triggerMorning = New-ScheduledTaskTrigger -Daily -At $MorningTime
$triggerEvening = New-ScheduledTaskTrigger -Daily -At $EveningTime

$settings = New-ScheduledTaskSettingsSet `
  -AllowStartIfOnBatteries `
  -DontStopIfGoingOnBatteries `
  -StartWhenAvailable `
  -ExecutionTimeLimit (New-TimeSpan -Hours 1)

$principal = New-ScheduledTaskPrincipal `
  -UserId $env:USERNAME `
  -LogonType Interactive `
  -RunLevel Limited

Register-ScheduledTask `
  -TaskName $TaskName `
  -Action $action `
  -Trigger @($triggerMorning, $triggerEvening) `
  -Settings $settings `
  -Principal $principal `
  -Description "IA Home : vérifie que Next.js répond sur localhost (api/version). Alerte Resend si arrêt."

Write-Host ""
Write-Host "Tâche enregistrée : $TaskName" -ForegroundColor Green
Write-Host "  Projet       : $ProjectRoot"
Write-Host "  Contrôles    : chaque jour à $MorningTime et $EveningTime"
Write-Host "  Commande     : `"$node`" `"$scriptPath`" --once"
Write-Host ""
Write-Host "Test manuel : npm run monitor:check" -ForegroundColor Cyan
Write-Host "Supprimer la tâche : Unregister-ScheduledTask -TaskName '$TaskName' -Confirm:`$false"
Write-Host ""
