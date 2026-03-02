# Restaure et configure BiRefNet sur localhost:7882 (birefnet.iahome.fr)
# Usage : .\scripts\setup-birefnet-local.ps1
# Depuis la racine du projet iahome.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$BirefnetDir = Join-Path $ProjectRoot "gradio-apps\birefnet"

Write-Host "`n=== Configuration BiRefNet (localhost:7882) ===" -ForegroundColor Cyan
Write-Host "   Cible : $BirefnetDir`n" -ForegroundColor Gray

# Creer le dossier gradio-apps si besoin
$GradioAppsDir = Join-Path $ProjectRoot "gradio-apps"
if (-not (Test-Path $GradioAppsDir)) {
    New-Item -ItemType Directory -Path $GradioAppsDir -Force | Out-Null
    Write-Host "[OK] Dossier gradio-apps cree." -ForegroundColor Green
}

# Cloner BiRefNet depuis Hugging Face si absent
if (-not (Test-Path $BirefnetDir)) {
    Write-Host "Clonage de BiRefNet (ZhengPeng7) depuis Hugging Face..." -ForegroundColor Yellow
    $parentDir = Split-Path $BirefnetDir -Parent
    Set-Location $parentDir
    git clone https://huggingface.co/spaces/ZhengPeng7/BiRefNet_demo birefnet
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Le clonage a echoue. Verifiez que git est installe et que vous avez acces a huggingface.co" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] BiRefNet clone." -ForegroundColor Green
    Set-Location $ProjectRoot
} else {
    Write-Host "[OK] BiRefNet deja present." -ForegroundColor Green
}

# Verifier app.py
$appPy = Join-Path $BirefnetDir "app.py"
if (-not (Test-Path $appPy)) {
    Write-Host "[ERREUR] app.py introuvable dans $BirefnetDir" -ForegroundColor Red
    exit 1
}

# Mettre a jour apps-hosts.config.ps1 (preserve les autres chemins)
$ConfigFile = Join-Path $ProjectRoot "scripts\apps-hosts.config.ps1"
$escapedPath = $BirefnetDir -replace '\\','\\'
if (Test-Path $ConfigFile) {
    $content = Get-Content $ConfigFile -Raw
    if ($content -match '\$BirefnetPath\s*=') {
        $content = $content -replace '(\$BirefnetPath\s*=\s*)"[^"]*"', "`$1`"$escapedPath`""
    } else {
        $content += "`n`$BirefnetPath     = `"$escapedPath`""
    }
    $content | Out-File -FilePath $ConfigFile -Encoding utf8 -NoNewline:$false
} else {
    $defaultConfig = @"
# Configuration pour start-apps-gradio-et-homeassistant.ps1
`$PhotomakerPath   = ""
`$BirefnetPath     = "$escapedPath"
`$Florence2Path    = ""
`$AnimagineXLPath  = ""
"@
    $defaultConfig | Out-File -FilePath $ConfigFile -Encoding utf8
}
Write-Host "[OK] Configuration mise a jour : scripts\apps-hosts.config.ps1" -ForegroundColor Green

# Creer venv et installer les dependances si necessaire
$venvPath = Join-Path $BirefnetDir ".venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "`nCreation de l'environnement virtuel et installation des dependances..." -ForegroundColor Yellow
    Set-Location $BirefnetDir
    python -m venv .venv
    $pythonExe = Join-Path $venvPath "Scripts\python.exe"
    & $pythonExe -m pip install --upgrade pip
    if (Test-Path (Join-Path $BirefnetDir "requirements.txt")) {
        & $pythonExe -m pip install -r requirements.txt
    } else {
        & $pythonExe -m pip install "gradio>=4.0" "transformers" "torch" "torchvision" "Pillow" "huggingface-hub"
    }
    Write-Host "[OK] Dependances installees." -ForegroundColor Green
}

# Lancer BiRefNet sur le port 7882
Write-Host "`nDemarrage de BiRefNet sur http://localhost:7882 ..." -ForegroundColor Yellow
Write-Host "   (Premier demarrage : telechargement des modeles, peut prendre plusieurs minutes)" -ForegroundColor Gray

Set-Location $BirefnetDir
$env:GRADIO_SERVER_PORT = "7882"
$env:GRADIO_SERVER_NAME = "0.0.0.0"

$pythonExe = Join-Path $venvPath "Scripts\python.exe"
if (Test-Path $pythonExe) {
    & $pythonExe app.py
} else {
    python app.py
}
