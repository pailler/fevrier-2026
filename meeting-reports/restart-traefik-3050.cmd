@echo off
echo ========================================
echo   Redémarrage Traefik - Port 3050
echo ========================================

echo.
echo 1. Copie des configurations...
copy "traefik-meeting-reports.yml" "C:\Users\AAA\Documents\iahome\traefik\dynamic\" >nul
copy "traefik-meeting-reports-api.yml" "C:\Users\AAA\Documents\iahome\traefik\dynamic\" >nul

echo.
echo 2. Redémarrage de Traefik...
taskkill /F /IM traefik.exe >nul 2>&1
timeout /t 2 /nobreak >nul

cd /d C:\Users\AAA\Documents\iahome\traefik
start "Traefik" cmd /k "traefik.exe --configfile=traefik.yml"

echo.
echo ========================================
echo   Traefik redémarré !
echo ========================================
echo.
echo Configuration mise à jour pour port 3050
echo.
pause
