<#
.SYNOPSIS
  Tâche planifiée Windows : audit SEO iahome.fr (hebdomadaire).
#>
param(
  [string]$ProjectRoot = "",
  [ValidateSet("Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday")]
  [string]$DayOfWeek = "Monday",
  [string]$RunTime = "07:30",
  [string]$TaskName = "IAHome-SEO-Weekly"
)

$ErrorActionPreference = "Stop"

if (-not $ProjectRoot) {
  $ProjectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
} else {
  $ProjectRoot = (Resolve-Path $ProjectRoot).Path
}

$scriptPath = Join-Path $ProjectRoot "scripts\seo\run-all.mjs"
if (-not (Test-Path $scriptPath)) {
  throw "Script introuvable : $scriptPath"
}

$node = (Get-Command node -ErrorAction Stop).Source
$logDir = Join-Path $ProjectRoot "logs"
if (-not (Test-Path $logDir)) { New-Item -ItemType Directory -Path $logDir | Out-Null }
$logFile = Join-Path $logDir "seo-weekly.log"

Unregister-ScheduledTask -TaskName $TaskName -Confirm:$false -ErrorAction SilentlyContinue

$psCommand = "Set-Location '$ProjectRoot'; & '$node' '$scriptPath' 2>&1 | Tee-Object -FilePath '$logFile' -Append"

$action = New-ScheduledTaskAction -Execute "powershell.exe" `
  -Argument "-NoProfile -ExecutionPolicy Bypass -Command `"$psCommand`"" `
  -WorkingDirectory $ProjectRoot

$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $DayOfWeek -At $RunTime

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger `
  -Description "Audit SEO hebdomadaire iahome.fr" | Out-Null

Write-Host "Tache '$TaskName' : chaque $DayOfWeek a $RunTime"
Write-Host "Logs : $logFile"
Write-Host "Test : npm run seo:check"
