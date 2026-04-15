@echo off
setlocal EnableExtensions
cd /d "%~dp0"

:: Poids sous models/ — chemins attendus par app.py (sd-vae, whisper, face-parse-bisent, etc.)
:: Le script Python evite le cas ou `hf download` + miroir ne laissent que des .metadata dans .cache.

set CheckpointsDir=models
mkdir "%CheckpointsDir%\musetalk" 2>nul
mkdir "%CheckpointsDir%\musetalkV15" 2>nul
mkdir "%CheckpointsDir%\syncnet" 2>nul
mkdir "%CheckpointsDir%\dwpose" 2>nul
mkdir "%CheckpointsDir%\face-parse-bisent" 2>nul
mkdir "%CheckpointsDir%\sd-vae" 2>nul
mkdir "%CheckpointsDir%\whisper" 2>nul

:: Optionnel : decommentez si vous utilisez un miroir (peut parfois mal materialiser les fichiers)
:: set HF_ENDPOINT=https://hf-mirror.com

if exist ".venv\Scripts\python.exe" (
  echo [INFO] Utilisation du venv : .venv\Scripts\python.exe
  ".venv\Scripts\python.exe" -m pip install -q -U "huggingface_hub>=0.20"
  ".venv\Scripts\python.exe" "%~dp0download_weights.py"
) else (
  echo [WARN] Pas de .venv — utilisation de python sur le PATH
  python -m pip install -q -U "huggingface_hub>=0.20"
  python "%~dp0download_weights.py"
)

if errorlevel 1 (
  echo Echec du telechargement Python. Ancienne methode CLI ci-dessous...
  pip install -U "huggingface_hub[hf_xet]"
  hf download TMElyralab/MuseTalk --local-dir %CheckpointsDir%
  hf download stabilityai/sd-vae-ft-mse --local-dir %CheckpointsDir%\sd-vae --include "config.json" "diffusion_pytorch_model.bin"
  hf download openai/whisper-tiny --local-dir %CheckpointsDir%\whisper --include "config.json" "pytorch_model.bin" "preprocessor_config.json"
  hf download yzd-v/DWPose --local-dir %CheckpointsDir%\dwpose --include "dw-ll_ucoco_384.pth"
  hf download ByteDance/LatentSync --local-dir %CheckpointsDir%\syncnet --include "latentsync_syncnet.pt"
  hf download ManyOtherFunctions/face-parse-bisent --local-dir %CheckpointsDir%\face-parse-bisent --include "79999_iter.pth" "resnet18-5c106cde.pth"
)

echo.
echo Si app.py signale encore des fichiers manquants, lancez : .\.venv\Scripts\python.exe download_weights.py
endlocal

