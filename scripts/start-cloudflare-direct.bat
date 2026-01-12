@echo off
REM Script pour demarrer Cloudflare Tunnel directement sans service Windows

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\start-cloudflare-direct.ps1"

pause














