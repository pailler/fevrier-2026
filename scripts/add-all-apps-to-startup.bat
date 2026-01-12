@echo off
echo ============================================================
echo   Ajout de toutes les applications au demarrage
echo   (Stability Matrix, Hunyuan3D-2, ComfyUI, StableDiffusion, RuinedFooocus)
echo ============================================================
echo.

REM Chemin vers le script PowerShell
set "SCRIPT_PATH=%~dp0add-all-apps-to-startup.ps1"

REM Executer le script PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"

pause

