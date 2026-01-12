# Script PowerShell pour démarrer l'application avec le cache des modèles

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Demarrage Application Photo Animation" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

# Vérifier le cache
$cacheDir = Join-Path (Split-Path -Parent $RootPath) "ai-models-cache\huggingface"
Write-Host "Cache des modeles: $cacheDir" -ForegroundColor Yellow
if (Test-Path $cacheDir) {
    Write-Host "[OK] Dossier cache existe" -ForegroundColor Green
} else {
    Write-Host "[WARNING] Dossier cache n'existe pas, creation..." -ForegroundColor Yellow
    New-Item -ItemType Directory -Path $cacheDir -Force | Out-Null
}

# Arrêter les processus existants sur le port 7860
Write-Host ""
Write-Host "Liberation du port 7860..." -ForegroundColor Yellow
$port7860 = Get-NetTCPConnection -LocalPort 7860 -ErrorAction SilentlyContinue
if ($port7860) {
    $proc = Get-Process -Id $port7860.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "[OK] Processus arrete" -ForegroundColor Green
    }
} else {
    Write-Host "[OK] Port 7860 libre" -ForegroundColor Green
}

Write-Host ""
Write-Host "Demarrage de l'application..." -ForegroundColor Yellow
Write-Host "Port: 7860" -ForegroundColor Gray
Write-Host "URL: http://localhost:7860" -ForegroundColor Gray
Write-Host ""
Write-Host "Le chargement du modele peut prendre plusieurs minutes..." -ForegroundColor Yellow
Write-Host ""

# Démarrer l'application
python app.py
