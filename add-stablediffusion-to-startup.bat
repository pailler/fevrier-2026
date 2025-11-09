@echo off
echo ============================================================
echo   Ajout de StableDiffusion au demarrage automatique
echo ============================================================
echo.

REM Chemin vers le script PowerShell
set "SCRIPT_PATH=%~dp0add-stablediffusion-to-startup.ps1"

REM Executer le script PowerShell
powershell.exe -ExecutionPolicy Bypass -File "%SCRIPT_PATH%"

pause

