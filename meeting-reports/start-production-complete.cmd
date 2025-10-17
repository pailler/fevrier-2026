@echo off
echo ========================================
echo  Meeting Reports - Production Complete
echo ========================================
echo.

echo 1. Nettoyage des processus existants...
taskkill /f /im node.exe 2>nul
taskkill /f /im cloudflared.exe 2>nul
taskkill /f /im python.exe 2>nul
timeout /t 3 /nobreak >nul

echo 2. Démarrage du Backend (port 8001)...
start "Backend Meeting Reports" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python start.py"

echo 3. Attente de 10 secondes...
timeout /t 10 /nobreak >nul

echo 4. Test du backend...
curl -s http://localhost:8001/health >nul
if %errorlevel% neq 0 (
    echo ERREUR: Backend non accessible
    pause
    exit /b 1
)
echo Backend OK

echo 5. Démarrage du Frontend (port 3050) avec configuration domaine...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend
set PORT=3050
set PUBLIC_URL=https://meeting-reports.iahome.fr
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set WDS_SOCKET_HOST=localhost
start "Frontend Meeting Reports" cmd /k "npm start"

echo 6. Attente de 20 secondes...
timeout /t 20 /nobreak >nul

echo 7. Test du frontend local...
curl -s http://localhost:3050 >nul
if %errorlevel% neq 0 (
    echo ERREUR: Frontend non accessible
    pause
    exit /b 1
)
echo Frontend OK

echo 8. Démarrage de Cloudflare...
cd /d C:\Users\AAA\Documents\iahome
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --config cloudflare-complete-config.yml run"

echo 9. Attente de 15 secondes...
timeout /t 15 /nobreak >nul

echo 10. Test de l'accès via le domaine...
curl -s https://meeting-reports.iahome.fr >nul
if %errorlevel% neq 0 (
    echo ATTENTION: Domaine non accessible, mais services locaux OK
) else (
    echo Domaine OK
)

echo.
echo ========================================
echo  Services démarrés !
echo ========================================
echo.
echo URLs:
echo   Frontend Local: http://localhost:3050
echo   Backend Local:  http://localhost:8001
echo   Production:     https://meeting-reports.iahome.fr
echo.
echo Configuration:
echo   Port 3000: iahome.fr
echo   Port 3050: meeting-reports.iahome.fr
echo.
echo Appuyez sur une touche pour continuer...
pause >nul
