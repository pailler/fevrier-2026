@echo off
echo ============================================================
echo   Retrait de StableDiffusion du demarrage automatique
echo ============================================================
echo.

REM Chemin vers le script PowerShell
set "SCRIPT_PATH=%~dp0remove-stablediffusion-from-startup.ps1"

REM Executer le script PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"

pause

