@echo off
echo ========================================
echo   Démarrage des Deux Sites
echo ========================================

echo.
echo 1. Nettoyage des processus...
taskkill /F /IM node.exe >nul 2>&1
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul

echo.
echo 2. Démarrage d'IAhome.fr (port 3000)...
start "IAhome.fr" cmd /k "cd /d C:\Users\AAA\Documents\iahome && npm start"

echo.
echo 3. Attente de 5 secondes...
timeout /t 5 /nobreak >nul

echo.
echo 4. Démarrage du Backend Meeting Reports (port 8001)...
start "Backend Meeting Reports" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 5. Attente de 3 secondes...
timeout /t 3 /nobreak >nul

echo.
echo 6. Démarrage du Frontend Meeting Reports (port 3050)...
start "Frontend Meeting Reports" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && npm start"

echo.
echo ========================================
echo   Sites démarrés !
echo ========================================
echo.
echo URLs:
echo   IAhome.fr: http://localhost:3000
echo   Meeting Reports: http://localhost:3050
echo   API Backend: http://localhost:8001
echo.
echo Production:
echo   https://iahome.fr
echo   https://meeting-reports.iahome.fr
echo.
pause
