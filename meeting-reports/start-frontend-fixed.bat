@echo off
echo ========================================
echo   Demarrage Frontend Meeting Reports
echo ========================================

cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

echo Configuration des variables d'environnement...
set PORT=3001
set HOST=0.0.0.0
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api

echo.
echo Configuration:
echo   PORT: %PORT%
echo   HOST: %HOST%
echo   API_URL: %REACT_APP_API_URL%
echo.

echo Demarrage du frontend sur le port 3001...
echo.

REM Forcer l'utilisation de react-scripts au lieu de next
npx react-scripts start

pause
