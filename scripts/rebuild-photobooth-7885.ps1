# Relance le serveur Photobooth sur localhost:7885 (NODE_ENV=production).
# Il n'y a pas de build webpack : les fichiers statiques + server.js sont servis tels quels.
#
# Usage (depuis la racine du depot ou depuis scripts/) :
#   .\scripts\rebuild-photobooth-7885.ps1
#   .\scripts\rebuild-photobooth-7885.ps1 -Foreground    # garde le serveur dans cette fenetre (bloquant)
#   .\scripts\rebuild-photobooth-7885.ps1 -Install      # npm install avant le demarrage
#
# Port : PHOTOBOOTH_PORT (defaut 7885) dans photobooth/server.js

param(
    [switch]$Foreground,
    [switch]$Install
)

$ErrorActionPreference = "Stop"

$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = Get-Location
}

. (Join-Path $PSScriptRoot "port-utils.ps1")

$PhotoboothDir = Join-Path $ProjectRoot "photobooth"
$Pkg = Join-Path $PhotoboothDir "package.json"
if (-not (Test-Path $Pkg)) {
    Write-Host "Dossier photobooth introuvable : $PhotoboothDir" -ForegroundColor Red
    exit 1
}

$Port = 7885
Write-Host "Photobooth : arret des ecouteurs sur le port $Port..." -ForegroundColor Cyan
$n = Stop-ListenersOnPort -Port $Port
if ($n -gt 0) {
    Write-Host "  $n processus arrete(s)." -ForegroundColor Yellow
} else {
    Write-Host "  Aucun ecouteur sur $Port." -ForegroundColor Gray
}

if ($Install) {
    Write-Host "npm install dans photobooth..." -ForegroundColor Cyan
    Push-Location $PhotoboothDir
    try {
        npm install
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
    } finally {
        Pop-Location
    }
}

Write-Host "Demarrage photobooth (npm run start:prod)..." -ForegroundColor Green

if ($Foreground) {
    Push-Location $PhotoboothDir
    try {
        npm run start:prod
    } finally {
        Pop-Location
    }
} else {
    $photoboothDirEscaped = $PhotoboothDir.Replace("'", "''")
    $argList = @(
        "-NoExit",
        "-NoLogo",
        "-Command",
        "Set-Location -LiteralPath '$photoboothDirEscaped'; npm run start:prod"
    )
    Start-Process -FilePath "powershell.exe" -WorkingDirectory $PhotoboothDir -ArgumentList $argList
    Write-Host "Nouvelle fenetre PowerShell : http://localhost:$Port" -ForegroundColor Green
}
