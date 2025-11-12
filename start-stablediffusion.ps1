# Script pour dÃ©marrer StableDiffusion via Stability Matrix
Write-Host "[DEMARRAGE] DÃ©marrage de StableDiffusion..." -ForegroundColor Cyan

# VÃ©rifier si Stability Matrix est installÃ©
$stabilityMatrixPath = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\StabilityMatrix.exe"
$stabilityMatrixPath = Resolve-Path $stabilityMatrixPath -ErrorAction SilentlyContinue

if (-not $stabilityMatrixPath) {
    Write-Host "[ERREUR] Impossible de trouver StabilityMatrix.exe" -ForegroundColor Red
    exit 1
}

# VÃ©rifier si Stability Matrix est dÃ©jÃ  en cours d'exÃ©cution
$stabilityMatrixProcess = Get-Process -Name "StabilityMatrix" -ErrorAction SilentlyContinue

if (-not $stabilityMatrixProcess) {
    # DÃ©marrer Stability Matrix
    $stabilityMatrixDir = Split-Path $stabilityMatrixPath
    Start-Process -FilePath $stabilityMatrixPath -WorkingDirectory $stabilityMatrixDir -WindowStyle Normal
    Write-Host "[OK] Stability Matrix dÃ©marrÃ©" -ForegroundColor Green
} else {
    Write-Host "[OK] Stability Matrix est dÃ©jÃ  en cours d'exÃ©cution" -ForegroundColor Green
}

Write-Host "[INFO] StableDiffusion sera accessible via Stability Matrix" -ForegroundColor Yellow
