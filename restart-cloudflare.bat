@echo off
REM Script pour redémarrer Cloudflare Tunnel sans ouvrir PowerShell
REM Peut être exécuté en double-cliquant dessus

echo ========================================
echo   Redemarrage de Cloudflare Tunnel
echo ========================================
echo.

REM Vérifier si le service existe
sc query cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] Le service cloudflared n'est pas installe
    echo.
    echo Pour installer le service :
    echo 1. Ouvrir PowerShell en tant qu'administrateur
    echo 2. Executer : .\install-cloudflare-service.ps1
    pause
    exit /b 1
)

echo [INFO] Arret du service Cloudflare Tunnel...
net stop cloudflared
if %errorlevel% neq 0 (
    echo [AVERTISSEMENT] Le service etait peut-etre deja arrete
)

timeout /t 3 /nobreak >nul

echo [INFO] Demarrage du service Cloudflare Tunnel...
net start cloudflared
if %errorlevel% neq 0 (
    echo [ERREUR] Impossible de demarrer le service
    echo.
    echo Verifiez que vous avez les droits administrateur
    pause
    exit /b 1
)

echo.
echo [SUCCES] Cloudflare Tunnel redemarre avec succes !
echo.
echo Attendez 30 secondes pour que le tunnel se reconnecte...
timeout /t 30 /nobreak >nul

echo.
echo ========================================
echo   Verification du statut
echo ========================================
sc query cloudflared | findstr "STATE"
echo.
echo Si le statut est "RUNNING", tout fonctionne correctement.
echo.
pause






