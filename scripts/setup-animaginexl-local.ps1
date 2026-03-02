# Restaure et configure Animagine XL sur localhost:7883 (animaginexl.iahome.fr)
# Usage : .\scripts\setup-animaginexl-local.ps1
# Depuis la racine du projet iahome.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
$AnimagineXLDir = Join-Path $ProjectRoot "gradio-apps\animagine-xl"

Write-Host "`n=== Configuration Animagine XL (localhost:7883) ===" -ForegroundColor Cyan
Write-Host "   Cible : $AnimagineXLDir`n" -ForegroundColor Gray

# Creer le dossier gradio-apps si besoin
$GradioAppsDir = Join-Path $ProjectRoot "gradio-apps"
if (-not (Test-Path $GradioAppsDir)) {
    New-Item -ItemType Directory -Path $GradioAppsDir -Force | Out-Null
    Write-Host "[OK] Dossier gradio-apps cree." -ForegroundColor Green
}

# Cloner Animagine XL depuis Hugging Face si absent
if (-not (Test-Path $AnimagineXLDir)) {
    Write-Host "Clonage de Animagine XL (Asahina2K) depuis Hugging Face..." -ForegroundColor Yellow
    $parentDir = Split-Path $AnimagineXLDir -Parent
    Set-Location $parentDir
    git clone https://huggingface.co/spaces/Asahina2K/animagine-xl-4.0 animagine-xl
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERREUR] Le clonage a echoue. Verifiez que git est installe et que vous avez acces a huggingface.co" -ForegroundColor Red
        exit 1
    }
    Write-Host "[OK] Animagine XL clone." -ForegroundColor Green
    Set-Location $ProjectRoot
} else {
    Write-Host "[OK] Animagine XL deja present." -ForegroundColor Green
}

# Verifier app.py
$appPy = Join-Path $AnimagineXLDir "app.py"
if (-not (Test-Path $appPy)) {
    Write-Host "[ERREUR] app.py introuvable dans $AnimagineXLDir" -ForegroundColor Red
    exit 1
}

# Mettre a jour apps-hosts.config.ps1 (preserve les autres chemins)
$ConfigFile = Join-Path $ProjectRoot "scripts\apps-hosts.config.ps1"
$escapedPath = $AnimagineXLDir -replace '\\','\\'
if (Test-Path $ConfigFile) {
    $content = Get-Content $ConfigFile -Raw
    if ($content -match '\$AnimagineXLPath\s*=') {
        $content = $content -replace '(\$AnimagineXLPath\s*=\s*)"[^"]*"', "`$1`"$escapedPath`""
    } else {
        $content += "`n`$AnimagineXLPath  = `"$escapedPath`""
    }
    $content | Out-File -FilePath $ConfigFile -Encoding utf8 -NoNewline:$false
} else {
    $defaultConfig = @"
# Configuration pour start-apps-gradio-et-homeassistant.ps1
`$PhotomakerPath   = ""
`$BirefnetPath     = ""
`$Florence2Path    = ""
`$AnimagineXLPath  = "$escapedPath"
"@
    $defaultConfig | Out-File -FilePath $ConfigFile -Encoding utf8
}
Write-Host "[OK] Configuration mise a jour : scripts\apps-hosts.config.ps1" -ForegroundColor Green

# Creer venv et installer les dependances si necessaire
$venvPath = Join-Path $AnimagineXLDir ".venv"
if (-not (Test-Path $venvPath)) {
    Write-Host "`nCreation de l'environnement virtuel et installation des dependances..." -ForegroundColor Yellow
    Set-Location $AnimagineXLDir
    python -m venv .venv
    $pythonExe = Join-Path $venvPath "Scripts\python.exe"
    & $pythonExe -m pip install --upgrade pip
    if (Test-Path (Join-Path $AnimagineXLDir "requirements.txt")) {
        & $pythonExe -m pip install -r requirements.txt
    } else {
        & $pythonExe -m pip install "gradio>=4.0" "diffusers" "transformers" "accelerate" "safetensors" "torch" "torchvision" "huggingface-hub" "Pillow"
    }
    Write-Host "[OK] Dependances installees." -ForegroundColor Green
}

# Lancer Animagine XL sur le port 7883
Write-Host "`nDemarrage de Animagine XL sur http://localhost:7883 ..." -ForegroundColor Yellow
Write-Host "   (Premier demarrage : telechargement des modeles, peut prendre plusieurs minutes)" -ForegroundColor Gray

Set-Location $AnimagineXLDir
$env:GRADIO_SERVER_PORT = "7883"
$env:GRADIO_SERVER_NAME = "0.0.0.0"

$pythonExe = Join-Path $venvPath "Scripts\python.exe"
if (Test-Path $pythonExe) {
    & $pythonExe app.py
} else {
    python app.py
}
