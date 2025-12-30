@echo off
REM Script pour démarrer le monitoring de localhost:3000

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0monitor-localhost.ps1"

pause


