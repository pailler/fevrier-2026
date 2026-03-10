# Restaure et configure Florence-2 sur localhost:7884 (florence2.iahome.fr)
# Usage : .\scripts\setup-florence2-local.ps1
# Depuis la racine du projet iahome.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$Florence2Dir = Join-Path $ProjectRoot "gradio-apps\florence-2"

Write-Host "`n=== Configuration Florence-2 (localhost:7884) ===" -ForegroundColor Cyan
Write-Host "   Cible : $Florence2Dir`n" -ForegroundColor Gray

# Creer le dossier gradio-apps si besoin
$GradioAppsDir = Join-Path $ProjectRoot "gradio-apps"
if (-not (Test-Path $GradioAppsDir)) {
    New-Item -ItemType Directory -Path $GradioAppsDir -Force | Out-Null
    Write-Host "[OK] Dossier gradio-apps cree." -ForegroundColor Green
}

# Cloner Florence-2 depuis Hugging Face si absent
if (-not (Test-Path $Florence2Dir)) {
    Write-Host "Clonage de Florence-2 (gokaygokay) depuis Hugging Face..." -ForegroundColor Yellow
    $parentDir = Split-Path $Florence2Dir -Parent
    Set-Location $parentDir
    git clone https://huggingface.co/spaces/gokaygokay/Florence-2 florence-2
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Le clonage a echoue. Verifiez que git est installe et que vous avez acces a huggingface.co" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Florence-2 clone." -ForegroundColor Green
    Set-Location $ProjectRoot
} else {
    Write-Host "[OK] Florence-2 deja present." -ForegroundColor Green
}

# Verifier app.py
$appPy = Join-Path $Florence2Dir "app.py"
if (-not (Test-Path $appPy)) {
    Write-Host "[ERREUR] app.py introuvable dans $Florence2Dir" -ForegroundColor Red
    exit 1
}

# Mettre a jour apps-hosts.config.ps1 (preserve les autres chemins)
$ConfigFile = Join-Path $ProjectRoot "scripts\apps-hosts.config.ps1"
$escapedPath = $Florence2Dir -replace '\\','\\'
if (Test-Path $ConfigFile) {
    $content = Get-Content $ConfigFile -Raw
    if ($content -match '\$Florence2Path\s*=') {
        $content = $content -replace '(\$Florence2Path\s*=\s*)"[^"]*"', "`$1`"$escapedPath`""
    } else {
        $content += "`n`$Florence2Path    = `"$escapedPath`""
    }
    $content | Out-File -FilePath $ConfigFile -Encoding utf8 -NoNewline:$false
} else {
    $defaultConfig = @"
# Configuration pour start-apps-gradio-et-homeassistant.ps1
`$PhotomakerPath   = ""
`$BirefnetPath     = ""
`$Florence2Path    = "$escapedPath"
`$AnimagineXLPath  = ""
"@
    $defaultConfig | Out-File -FilePath $ConfigFile -Encoding utf8
}
Write-Host "[OK] Configuration mise a jour : scripts\apps-hosts.config.ps1" -ForegroundColor Green

# Creer venv et installer les dependances si necessaire
$venvPath = Join-Path $Florence2Dir ".venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "`nCreation de l'environnement virtuel et installation des dependances..." -ForegroundColor Yellow
    Set-Location $Florence2Dir
    python -m venv .venv
    $pythonExe = Join-Path $venvPath "Scripts\python.exe"
    & $pythonExe -m pip install --upgrade pip
    if (Test-Path (Join-Path $Florence2Dir "requirements.txt")) {
        & $pythonExe -m pip install -r requirements.txt
    } else {
        & $pythonExe -m pip install "gradio>=4.0" "transformers" "torch" "torchvision" "accelerate" "Pillow" "huggingface-hub"
    }
    Write-Host "[OK] Dependances installees." -ForegroundColor Green
}

# Lancer Florence-2 sur le port 7884
Write-Host "`nDemarrage de Florence-2 sur http://localhost:7884 ..." -ForegroundColor Yellow
Write-Host "   (Premier demarrage : telechargement des modeles, peut prendre plusieurs minutes)" -ForegroundColor Gray

Set-Location $Florence2Dir

# Cache Hugging Face - evite de retelecharger les modeles a chaque demarrage
$ModelsCache = Join-Path $ProjectRoot "models-cache"
if (-not (Test-Path $ModelsCache)) { New-Item -ItemType Directory -Path $ModelsCache -Force | Out-Null }
$env:HF_HOME = $ModelsCache
$env:HF_HUB_CACHE = Join-Path $ModelsCache "hub"
$env:TRANSFORMERS_CACHE = Join-Path $ModelsCache "transformers"

$env:GRADIO_SERVER_PORT = "7884"
$env:GRADIO_SERVER_NAME = "0.0.0.0"

$pythonExe = Join-Path $venvPath "Scripts\python.exe"
if (Test-Path $pythonExe) {
    & $pythonExe app.py
} else {
    python app.py
}
