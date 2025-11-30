@echo off
REM Script pour vérifier le statut de Cloudflare Tunnel sans ouvrir PowerShell

echo ========================================
echo   Statut de Cloudflare Tunnel
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

echo Statut du service :
sc query cloudflared | findstr "STATE"
echo.

echo Configuration du service :
sc qc cloudflared | findstr "START_TYPE"
echo.

echo.
echo ========================================
echo   Test de connexion
echo ========================================
echo.
echo Test de l'API consoles.regispailler.fr...
curl -s -o nul -w "HTTP Status: %%{http_code}\n" https://consoles.regispailler.fr/api/health 2>nul
if %errorlevel% equ 0 (
    echo [SUCCES] La connexion fonctionne !
) else (
    echo [AVERTISSEMENT] Impossible de tester la connexion
    echo Verifiez votre connexion Internet
)
echo.
pause






