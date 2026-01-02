@echo off
REM Script batch pour démarrer Docker Desktop (wrapper pour PowerShell)

echo 🐳 Démarrage de Docker Desktop...

REM Vérifier si PowerShell est disponible
powershell -ExecutionPolicy Bypass -File "%~dp0start-docker-desktop.ps1"

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ Erreur lors du démarrage de Docker Desktop
    pause
    exit /b %ERRORLEVEL%
)

echo.
echo ✅ Docker Desktop démarré avec succès!
pause
