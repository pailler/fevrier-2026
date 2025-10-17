@echo off
echo ========================================
echo   Démarrage Frontend sur Port 3001
echo ========================================

echo.
echo 1. Arrêt des processus Node existants...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1

echo.
echo 2. Attente de 3 secondes...
timeout /t 3 /nobreak >nul

echo.
echo 3. Vérification des ports...
netstat -an | findstr ":3001"

echo.
echo 4. Démarrage du frontend...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

set PORT=3001
set HOST=localhost
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set PUBLIC_URL=https://meeting-reports.iahome.fr

echo.
echo Configuration:
echo   PORT: %PORT%
echo   HOST: %HOST%
echo   API_URL: %REACT_APP_API_URL%
echo   PUBLIC_URL: %PUBLIC_URL%

echo.
echo Démarrage de React sur port 3001...
npm start
