# Redemarre l'app photo-animation (Gradio) sur le port 7887.
# Usage : .\restart-photobooth.ps1  (depuis photo-animation)
#      ou : .\photo-animation\restart-photobooth.ps1  (depuis racine iahome)

$ErrorActionPreference = "Continue"
$PhotoAnimDir = $PSScriptRoot
if (-not (Test-Path (Join-Path $PhotoAnimDir "app.py"))) {
    $PhotoAnimDir = Join-Path (Get-Location).Path "photo-animation"
}
$ProjectRoot = Split-Path -Parent $PhotoAnimDir
$Port = 7887
. (Join-Path $ProjectRoot "scripts\port-utils.ps1")

Write-Host "=== Redemarrage photo-animation (port $Port) ===" -ForegroundColor Cyan

if (Test-PortInUse -Port $Port) {
    $n = Stop-ListenersOnPort -Port $Port
    Write-Host "Arret de $n processus sur le port $Port" -ForegroundColor Yellow
    Start-Sleep -Milliseconds 600
} else {
    Write-Host "Port $Port : aucun listener" -ForegroundColor DarkGray
}

$env:PHOTOBOOTH_PORT = "$Port"
$env:GRADIO_SERVER_PORT = "$Port"
$py = "python"
$venvPy = Join-Path $PhotoAnimDir ".venv\Scripts\python.exe"
if (Test-Path -LiteralPath $venvPy) { $py = $venvPy }

Start-Process -FilePath $py -ArgumentList "app.py" -WorkingDirectory $PhotoAnimDir
Write-Host "Demarre: http://localhost:$Port (nouvelle console)" -ForegroundColor Green
