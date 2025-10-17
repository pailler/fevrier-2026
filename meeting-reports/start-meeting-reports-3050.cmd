@echo off
echo ========================================
echo   Meeting Reports Generator - Port 3050
echo ========================================

echo.
echo 1. Nettoyage des processus...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 2. Démarrage du Backend (port 8001)...
start "Backend API" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 3. Attente de 5 secondes...
timeout /t 5 /nobreak >nul

echo.
echo 4. Démarrage du Frontend (port 3050)...
start "Frontend React" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && npm start"

echo.
echo ========================================
echo   Services démarrés !
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:3050
echo   Backend:  http://localhost:8001
echo   Production: https://meeting-reports.iahome.fr
echo.
echo Note: Le port 3000 est réservé pour iahome.fr
echo Le port 3050 est utilisé pour Meeting Reports
echo.
pause
