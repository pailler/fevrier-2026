@echo off
REM Script pour rétablir Cloudflare Tunnel
REM Demande automatiquement les droits administrateur

cd /d "%~dp0"

REM Vérifier les droits administrateur et demander l'élévation si nécessaire
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Demande des droits administrateur...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoExit -File \"%~dp0restore-cloudflare.ps1\"' -Verb RunAs"
    exit /b
)

REM Exécuter le script PowerShell directement
powershell -ExecutionPolicy Bypass -NoExit -File "restore-cloudflare.ps1"








