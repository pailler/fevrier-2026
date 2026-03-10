@echo off
REM Demarre les 23 applications iahome.fr
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "%~dp0start-all-iahome-apps.ps1" %*
pause
