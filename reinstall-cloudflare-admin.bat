@echo off
REM Script batch pour réinstaller Cloudflare avec élévation automatique des droits administrateur

REM Vérifier les droits administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo Demande d'elevation des droits administrateur...
    REM Relancer avec élévation
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo   Reinstallation Cloudflare Tunnel
echo ========================================
echo.

cd /d "%~dp0"

REM Token fourni
set TOKEN=eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMDJhOTYwYzUtZWRkNi00YjNmLTg0NGYtNDEwYjE2MjQ3MjYyIiwicyI6InNuNXBuSm5qUnVTaXF5TVdRNXJWdGlZQXFqbkh2Z05sY1U4dWloV2tWMFE9In0=

echo [1/6] Arret du service actuel...
net stop cloudflared >nul 2>&1
timeout /t 2 /nobreak >nul
echo    OK

echo [2/6] Arret des processus cloudflared...
taskkill /F /IM cloudflared.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    OK

echo [3/6] Desinstallation de l'ancien service...
sc delete cloudflared >nul 2>&1
timeout /t 2 /nobreak >nul
echo    OK

echo [4/6] Installation du nouveau service avec le token...
"C:\Program Files (x86)\cloudflared\cloudflared.exe" service install %TOKEN%
if %errorlevel% neq 0 (
    echo    ERREUR lors de l'installation
    pause
    exit /b 1
)
echo    OK

echo [5/6] Demarrage du nouveau service...
net start cloudflared
if %errorlevel% neq 0 (
    echo    ERREUR lors du demarrage
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
echo    OK

echo [6/6] Verification...
sc query cloudflared | findstr "STATE"
echo.

echo ========================================
echo   Reinstallation terminee !
echo ========================================
echo.
echo Prochaines etapes :
echo 1. Attendez 2-3 minutes
echo 2. Verifiez dans Cloudflare Dashboard :
echo    https://one.dash.cloudflare.com/
echo    Zero Trust -^> Networks -^> Tunnels -^> iahome-new
echo 3. Le statut devrait passer a 'Healthy'
echo.
pause






