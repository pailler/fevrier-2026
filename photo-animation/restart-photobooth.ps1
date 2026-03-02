$ErrorActionPreference = "Stop"

Write-Host "=== Redemarrage Photobooth ===" -ForegroundColor Cyan

$port = 7885
$existing = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
if ($existing) {
    $pids = $existing | Select-Object -ExpandProperty OwningProcess -Unique
    foreach ($procId in $pids) {
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Host "Processus stoppe sur le port $port (PID $procId)" -ForegroundColor Yellow
        } catch {
            Write-Host "Impossible de stopper PID $procId: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "Aucun listener detecte sur le port $port" -ForegroundColor Green
}

$env:PHOTOBOOTH_PORT = "$port"
Write-Host "Demarrage Photobooth sur http://localhost:$port" -ForegroundColor Green
python app.py
