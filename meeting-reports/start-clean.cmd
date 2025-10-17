@echo off
echo ========================================
echo   Meeting Reports - Démarrage Propre
echo ========================================

echo.
echo 1. Nettoyage des processus...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 2. Démarrage du Backend...
start "Backend" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 3. Attente de 5 secondes...
timeout /t 5 /nobreak >nul

echo.
echo 4. Démarrage du Frontend...
start "Frontend" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && npm start"

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
echo Attendez que React démarre complètement.
echo.
pause
