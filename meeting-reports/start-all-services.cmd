@echo off
echo ========================================
echo   Meeting Reports Generator - Démarrage
echo ========================================

echo.
echo 1. Démarrage du backend...
start "Backend API" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 2. Attente de 5 secondes...
timeout /t 5 /nobreak > nul

echo.
echo 3. Démarrage du frontend...
start "Frontend React" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && set PORT=3001 && set HOST=localhost && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api && set PUBLIC_URL=https://meeting-reports.iahome.fr && npm start"

echo.
echo ========================================
echo   Services démarrés !
echo ========================================
echo.
echo URLs d'accès :
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:8001
echo   Production: https://meeting-reports.iahome.fr
echo.
echo Les services s'ouvrent dans des fenêtres séparées.
echo Fermez cette fenêtre une fois que tout fonctionne.
echo.
pause
