@echo off
REM Demarre librespeed, qrcodes et photobooth
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -File "%~dp0start-essentiels-services.ps1"
pause
