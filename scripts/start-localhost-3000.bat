@echo off
REM Script pour démarrer l'application Next.js sur localhost:3000

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\start-nextjs.ps1"

pause














