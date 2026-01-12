@echo off
REM Script simple pour demarrer Cloudflare Tunnel

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\start-cloudflare-simple.ps1"

pause














