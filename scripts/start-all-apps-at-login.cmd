@echo off
title iahome — start-all-apps
REM Delai (secondes) pour laisser Docker Desktop et le reseau s initialiser. Modifiable ci-dessous.
set IAHOME_STARTUP_DELAY=60
timeout /t %IAHOME_STARTUP_DELAY% /nobreak >nul
powershell.exe -NoLogo -ExecutionPolicy Bypass -NoProfile -WindowStyle Normal -File "%~dp0start-all-apps.ps1"
exit /b %ERRORLEVEL%
