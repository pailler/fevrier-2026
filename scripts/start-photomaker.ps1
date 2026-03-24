# Demarre uniquement PhotoMaker sur le port 7881
# Appelle start-all-apps.ps1 avec -PhotoMakerOnly
# Usage : .\scripts\start-photomaker.ps1

$ScriptDir = $PSScriptRoot
& (Join-Path $ScriptDir "start-all-apps.ps1") -PhotoMakerOnly
