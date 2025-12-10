@echo off
REM Script batch pour démarrer Home Assistant en arrière-plan
echo 🏠 Démarrage de Home Assistant...
powershell.exe -ExecutionPolicy Bypass -WindowStyle Hidden -File "%~dp0scripts\start-home-assistant-background.ps1"
if %ERRORLEVEL% EQU 0 (
    echo ✅ Home Assistant démarré avec succès
    echo 🌐 Accès local: http://localhost:8123
    echo 🌐 Accès production: https://homeassistant.iahome.fr
) else (
    echo ❌ Erreur lors du démarrage de Home Assistant
    pause
)

















