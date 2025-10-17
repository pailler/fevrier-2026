@echo off
echo ========================================
echo   Meeting Reports Generator - Demarrage
echo ========================================

echo.
echo 1. Demarrage du Backend...
start "Backend Meeting Reports" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python main-simple-working.py"

echo.
echo 2. Attente du demarrage du backend...
timeout /t 10 /nobreak

echo.
echo 3. Demarrage du Frontend...
start "Frontend Meeting Reports" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend && set PORT=3001 && set HOST=0.0.0.0 && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api && npm start"

echo.
echo ========================================
echo   Services demarres !
echo ========================================
echo.
echo Backend:  http://localhost:8001
echo Frontend: http://localhost:3001
echo Domaine:  https://meeting-reports.iahome.fr
echo.
echo Appuyez sur une touche pour fermer...
pause > nul
