# Restaure et demarre PhotoMaker sur localhost:7881 (photomaker.iahome.fr)
# Usage : .\scripts\setup-photomaker-local.ps1
# Depuis la racine du projet iahome.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$PhotoMakerDir = Join-Path $ProjectRoot "gradio-apps\photomaker"

Write-Host "`n=== Configuration PhotoMaker (localhost:7881) ===" -ForegroundColor Cyan
Write-Host "   Cible : $PhotoMakerDir`n" -ForegroundColor Gray

# Creer le dossier gradio-apps si besoin
$GradioAppsDir = Join-Path $ProjectRoot "gradio-apps"
if (-not (Test-Path $GradioAppsDir)) {
    New-Item -ItemType Directory -Path $GradioAppsDir -Force | Out-Null
    Write-Host "[OK] Dossier gradio-apps cree." -ForegroundColor Green
}

# Cloner PhotoMaker depuis Hugging Face si absent
if (-not (Test-Path $PhotoMakerDir)) {
    Write-Host "Clonage de PhotoMaker (TencentARC) depuis Hugging Face..." -ForegroundColor Yellow
    $parentDir = Split-Path $PhotoMakerDir -Parent
    Set-Location $parentDir
    git clone https://huggingface.co/spaces/TencentARC/PhotoMaker photomaker
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Le clonage a echoue. Verifiez que git est installe et que vous avez acces a huggingface.co" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] PhotoMaker clone." -ForegroundColor Green
    Set-Location $ProjectRoot
} else {
    Write-Host "[OK] PhotoMaker deja present." -ForegroundColor Green
}

# Verifier app.py
$appPy = Join-Path $PhotoMakerDir "app.py"
if (-not (Test-Path $appPy)) {
    Write-Host "[ERREUR] app.py introuvable dans $PhotoMakerDir" -ForegroundColor Red
    exit 1
}

# Mettre a jour apps-hosts.config.ps1
$ConfigFile = Join-Path $ProjectRoot "scripts\apps-hosts.config.ps1"
$configContent = @"
# Configuration pour start-apps-gradio-et-homeassistant.ps1
`$PhotomakerPath   = "$($PhotoMakerDir -replace '\\','\\')"
`$BirefnetPath     = ""
`$Florence2Path    = ""
`$AnimagineXLPath  = ""
"@
$configContent | Out-File -FilePath $ConfigFile -Encoding utf8
Write-Host "[OK] Configuration mise a jour : scripts\apps-hosts.config.ps1" -ForegroundColor Green

# Creer venv et installer les dependances si necessaire
$venvPath = Join-Path $PhotoMakerDir ".venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "`nCreation de l'environnement virtuel et installation des dependances..." -ForegroundColor Yellow
    Set-Location $PhotoMakerDir
    python -m venv .venv
    $pythonExe = Join-Path $venvPath "Scripts\python.exe"
    & $pythonExe -m pip install --upgrade pip
    if (Test-Path (Join-Path $PhotoMakerDir "requirements.txt")) {
        & $pythonExe -m pip install -r requirements.txt
    } else {
        & $pythonExe -m pip install "gradio>=4.0" "diffusers>=0.25" "transformers" "accelerate" "safetensors" "torch" "torchvision" "huggingface-hub" "Pillow" "spaces"
    }
    Write-Host "[OK] Dependances installees." -ForegroundColor Green
}

# Lancer PhotoMaker sur le port 7881
Write-Host "`nDemarrage de PhotoMaker sur http://localhost:7881 ..." -ForegroundColor Yellow
Write-Host "   (Premier demarrage : telechargement des modeles, peut prendre plusieurs minutes)" -ForegroundColor Gray

Set-Location $PhotoMakerDir
$env:GRADIO_SERVER_PORT = "7881"
$env:GRADIO_SERVER_NAME = "0.0.0.0"

$pythonExe = Join-Path $venvPath "Scripts\python.exe"
if (Test-Path $pythonExe) {
    & $pythonExe app.py
} else {
    python app.py
}
