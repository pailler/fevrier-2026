# Demarre uniquement PhotoMaker sur le port 7881
# Appelle start-all-apps.ps1 avec -PhotoMakerOnly
# Usage : .\scripts\start-photomaker.ps1
#         .\scripts\start-photomaker.ps1 -Restart

param([switch]$Restart)
$ScriptDir = $PSScriptRoot
$argsP = @{ PhotoMakerOnly = $true }
if ($Restart) { $argsP.Restart = $true }
& (Join-Path $ScriptDir "start-all-apps.ps1") @argsP
