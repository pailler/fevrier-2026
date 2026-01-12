@echo off
REM Script pour reconstruire et démarrer localhost:3000 en mode production (iahome.fr)

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0rebuild-production.ps1"

pause



