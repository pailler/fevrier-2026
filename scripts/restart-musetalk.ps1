# Redemarre MuseTalk (port 7886) - racine du depot ou depuis scripts/
# Usage :
#   .\scripts\restart-musetalk.ps1
#   .\scripts\restart-musetalk.ps1 -BehindTraefik   # prod / musetalk.iahome.fr (en-tetes proxy + hostname Gradio)
# Variables utiles en prod sur l'hote qui ecoute 7886 : MUSETALK_COOKIE_SECRET, IAHOME_API_BASE

param(
    [switch]$BehindTraefik
)

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = Get-Location
}
. (Join-Path $PSScriptRoot "port-utils.ps1")
$MuseTalkDir = Join-Path $ProjectRoot "gradio-apps\musetalk"
if (-not (Test-Path (Join-Path $MuseTalkDir "app.py"))) {
    Write-Host "Dossier MuseTalk introuvable : $MuseTalkDir" -ForegroundColor Red
    exit 1
}

$Port = 7886
Stop-ListenersOnPort -Port $Port

$pythonExe = Join-Path $MuseTalkDir ".venv\Scripts\python.exe"
if (-not (Test-Path $pythonExe)) { $pythonExe = "python" }

$env:GRADIO_SERVER_PORT = "$Port"
$env:GRADIO_SERVER_NAME = "0.0.0.0"

if ($BehindTraefik) {
    $env:MUSETALK_TRUST_PROXY = "1"
    $env:MUSETALK_PUBLIC_HOST = "musetalk.iahome.fr"
    Write-Host "Mode derriere Traefik : MUSETALK_TRUST_PROXY=1, MUSETALK_PUBLIC_HOST=musetalk.iahome.fr" -ForegroundColor Cyan
} else {
    Remove-Item Env:MUSETALK_TRUST_PROXY -ErrorAction SilentlyContinue
    Remove-Item Env:MUSETALK_PUBLIC_HOST -ErrorAction SilentlyContinue
}

Write-Host "Demarrage MuseTalk : $pythonExe app.py --port $Port --ip 0.0.0.0 --use_float16" -ForegroundColor Green
$psi = New-Object System.Diagnostics.ProcessStartInfo
$psi.FileName = $pythonExe
$psi.Arguments = "app.py --port $Port --ip 0.0.0.0 --use_float16"
$psi.WorkingDirectory = $MuseTalkDir
$psi.UseShellExecute = $true
$psi.CreateNoWindow = $false
$p = [System.Diagnostics.Process]::Start($psi)
Write-Host "MuseTalk demarre (PID $($p.Id)) - http://localhost:$Port" -ForegroundColor Green
if ($BehindTraefik) {
    Write-Host "Variables proxy actives pour https://musetalk.iahome.fr" -ForegroundColor Gray
}
