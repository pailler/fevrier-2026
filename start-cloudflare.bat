@echo off
REM Script pour démarrer le service Cloudflare Tunnel

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\start-cloudflare-service.ps1"

pause














