@echo off
echo ========================================
echo  Meeting Reports - Production Simple
echo ========================================
echo.

echo 1. Nettoyage des processus existants...
taskkill /f /im node.exe 2>nul
taskkill /f /im cloudflared.exe 2>nul
taskkill /f /im python.exe 2>nul
timeout /t 3 /nobreak >nul

echo 2. Démarrage du Backend (port 8001)...
start "Backend Meeting Reports" cmd /k "cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend && python start.py"

echo 3. Attente de 15 secondes...
timeout /t 15 /nobreak >nul

echo 4. Démarrage du Frontend (port 3050)...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend
set PORT=3050
set PUBLIC_URL=https://meeting-reports.iahome.fr
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set WDS_SOCKET_HOST=localhost
start "Frontend Meeting Reports" cmd /k "npm start"

echo 5. Attente de 20 secondes...
timeout /t 20 /nobreak >nul

echo 6. Démarrage de Cloudflare...
cd /d C:\Users\AAA\Documents\iahome
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --config cloudflare-complete-config.yml run"

echo 7. Attente de 15 secondes...
timeout /t 15 /nobreak >nul

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
echo Vérifiez les fenêtres de commande pour les logs
echo.
pause
