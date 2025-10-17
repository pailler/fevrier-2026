@echo off
echo ========================================
echo   Meeting Reports - Démarrage Simple
echo ========================================

echo.
echo 1. Démarrage du Backend...
start "Backend API" cmd /c "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 2. Attente de 3 secondes...
timeout /t 3 /nobreak >nul

echo.
echo 3. Démarrage du Frontend...
start "Frontend React" cmd /c "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && set PORT=3001 && set HOST=localhost && set WDS_SOCKET_HOST=localhost && set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api && set PUBLIC_URL=https://meeting-reports.iahome.fr && npm start"

echo.
echo ========================================
echo   Services démarrés !
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:3001
echo   Backend:  http://localhost:8001
echo   Production: https://meeting-reports.iahome.fr
echo.
echo Les services s'ouvrent dans des fenêtres séparées.
echo.
pause
