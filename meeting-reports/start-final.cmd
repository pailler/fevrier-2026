@echo off
echo ========================================
echo   DÉMARRAGE FINAL - Meeting Reports
echo ========================================

echo.
echo 1. Nettoyage complet...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM npm.exe >nul 2>&1
timeout /t 3 /nobreak >nul

echo.
echo 2. Démarrage du backend...
start "Backend" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 3. Attente de 5 secondes...
timeout /t 5 /nobreak >nul

echo.
echo 4. Démarrage du frontend...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

set PORT=3001
set HOST=localhost
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set PUBLIC_URL=https://meeting-reports.iahome.fr

echo Configuration:
echo   PORT: %PORT%
echo   HOST: %HOST%
echo   API_URL: %REACT_APP_API_URL%

echo.
echo Démarrage de React...
start "Frontend" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && set PORT=3001 && set HOST=localhost && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api && set PUBLIC_URL=https://meeting-reports.iahome.fr && npm start"

echo.
echo ========================================
echo   SERVICES DÉMARRÉS !
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:8001
echo   Production: https://meeting-reports.iahome.fr
echo.
echo Les services s'ouvrent dans des fenêtres séparées.
echo Attendez que React démarre complètement.
echo.
pause
