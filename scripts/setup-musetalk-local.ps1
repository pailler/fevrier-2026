# Configure un venv Python et installe les dependances MuseTalk (gradio-apps/musetalk).
# Ensuite : dans ce dossier, lancer download_weights.bat (Windows) ou ./download_weights.sh
#
# Usage (depuis la racine iahome) :
#   .\scripts\setup-musetalk-local.ps1
#
# Si l'execution des scripts est bloquee :
#   powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\setup-musetalk-local.ps1

# Ne pas utiliser "Stop" ici : un "py -3.xx" absent ecrit sur stderr et avec Stop le script
# s'arreterait avant le fallback (python -m venv, py -3, autre 3.xx).
$ErrorActionPreference = "Continue"

$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$MuseTalkDir = Join-Path $ProjectRoot "gradio-apps\musetalk"

Write-Host "`n=== MuseTalk (localhost:7886) ===" -ForegroundColor Cyan

if (-not (Test-Path $MuseTalkDir)) {
    Write-Host "Dossier introuvable: $MuseTalkDir" -ForegroundColor Red
    Write-Host "Clonez le depot : git clone https://github.com/TMElyralab/MuseTalk.git gradio-apps\musetalk" -ForegroundColor Yellow
    exit 1
}

Push-Location $MuseTalkDir
try {
    $venvPython = Join-Path $MuseTalkDir ".venv\Scripts\python.exe"

    if (-not (Test-Path $venvPython)) {
        Write-Host "Creation du venv (.venv)..." -ForegroundColor Yellow
        $created = $false

        # Essayer py -3.xx (lanceur Windows). Ordre : 3.11 / 3.12 d'abord (wheels stables, evite 3.13),
        # puis 3.10 (MuseTalk upstream), enfin 3.13. Verifiez les installs avec : py -0p
        foreach ($ver in @('3.11', '3.12', '3.10', '3.13')) {
            $null = & py "-$ver" -m venv .venv 2>&1
            if (Test-Path $venvPython) {
                Write-Host "  OK venv cree avec py -$ver" -ForegroundColor Green
                $created = $true
                break
            }
        }

        if (-not $created) {
            Write-Host "  py -3.11 ... -3.13 indisponibles, essai: python -m venv .venv" -ForegroundColor DarkGray
            $null = & python -m venv .venv 2>&1
            if (-not (Test-Path $venvPython)) {
                $null = & py -3 -m venv .venv 2>&1
            }
        }

        $venvPython = Join-Path $MuseTalkDir ".venv\Scripts\python.exe"
    }

    if (-not (Test-Path $venvPython)) {
        Write-Host "Impossible de creer .venv." -ForegroundColor Red
        Write-Host "Installez Python 3.10+ depuis python.org et cochez 'Add to PATH', ou :" -ForegroundColor Yellow
        Write-Host "  py -0p   # liste des versions py" -ForegroundColor White
        exit 1
    }

    $pyVerLine = & $venvPython --version 2>&1
    Write-Host "  Python du venv : $pyVerLine" -ForegroundColor Gray
    if ($pyVerLine -match '3\.(1[3-9]|[2-9][0-9])') {
        Write-Host "  [INFO] MuseTalk cible surtout Python 3.10 ; avec 3.13+, pip peut refuser certaines versions (ex. tensorflow)." -ForegroundColor Yellow
        Write-Host "         Si l'install echoue, ajoutez Python 3.11 via python.org ou `py install 3.11` puis recreez le venv." -ForegroundColor Yellow
    }

    Write-Host "Mise a jour pip..." -ForegroundColor Gray
    & $venvPython -m pip install -U pip wheel
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec pip install -U pip wheel (code $LASTEXITCODE)." -ForegroundColor Red
        exit 1
    }

    Write-Host "Installation requirements.txt (peut prendre plusieurs minutes)..." -ForegroundColor Yellow
    & $venvPython -m pip install -r requirements.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Echec pip install -r requirements.txt (code $LASTEXITCODE)." -ForegroundColor Red
        exit 1
    }

    # Sur Windows, mmdet/mmpose (DWPose) chargent mmcv.ops : le wheel OpenMMLab mmcv 2.0.1 est lie a torch 2.0.x.
    # Sans ca, pip peut installer torch 2.1x+ et l'import mmcv._ext echoue (CONNECTION_REFUSED au navigateur = app jamais demarree).
    if ($env:OS -eq "Windows_NT") {
        Write-Host "Alignement torch 2.0.1 / torchvision (CPU) pour mmcv Windows..." -ForegroundColor Yellow
        & $venvPython -m pip install "torch==2.0.1" "torchvision==0.15.2" --index-url "https://download.pytorch.org/whl/cpu"
        if ($LASTEXITCODE -ne 0) {
            Write-Host "Echec alignement torch (code $LASTEXITCODE)." -ForegroundColor Red
            exit 1
        }
        $cpTag = & $venvPython -c "import sys; v=sys.version_info; print(f'cp{v.major}{v.minor}')" 2>&1
        if ($cpTag -match '^cp\d+$') {
            $mmcvWhl = "https://download.openmmlab.com/mmcv/dist/cpu/torch2.0.0/mmcv-2.0.1-$cpTag-$cpTag-win_amd64.whl"
            Write-Host "mmcv 2.0.1 (wheel OpenMMLab, $cpTag)..." -ForegroundColor Yellow
            & $venvPython -m pip uninstall mmcv -y 2>$null
            & $venvPython -m pip install $mmcvWhl --no-deps
            if ($LASTEXITCODE -ne 0) {
                Write-Host "[AVERTISSEMENT] Wheel mmcv introuvable pour $cpTag ; installez mmcv manuellement (doc OpenMMLab)." -ForegroundColor Yellow
            }
        }
    }

    Write-Host "`nEtape suivante : telecharger les poids" -ForegroundColor Green
    Write-Host "  cd gradio-apps\musetalk" -ForegroundColor White
    Write-Host "  .\download_weights.bat" -ForegroundColor White
    Write-Host "`nPuis demarrer avec start-all-apps.ps1 ou :" -ForegroundColor Green
    Write-Host "  .\.venv\Scripts\python.exe app.py --port 7886 --ip 0.0.0.0 --use_float16" -ForegroundColor White
}
finally {
    Pop-Location
}
