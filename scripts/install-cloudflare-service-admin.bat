@echo off
REM Script batch pour installer Cloudflare Tunnel comme service Windows avec démarrage automatique
REM Emplacement : scripts/install-cloudflare-service-admin.bat
REM Ce script demande automatiquement les droits administrateur

REM Vérifier les droits administrateur
net session >nul 2>&1
if %errorlevel% neq 0 (
    echo ========================================
    echo   Installation Cloudflare Tunnel
    echo   Demande d'elevation des droits...
    echo ========================================
    echo.
    REM Relancer avec élévation
    powershell -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
    exit /b
)

echo ========================================
echo   Installation Cloudflare Tunnel
echo   Service Windows avec demarrage auto
echo ========================================
echo.

cd /d "%~dp0\.."

REM Vérifier que cloudflared est disponible
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERREUR] cloudflared n'est pas trouve dans le PATH
    echo.
    echo Veuillez installer cloudflared et l'ajouter au PATH
    echo Telechargement : https://github.com/cloudflare/cloudflared/releases
    echo.
    pause
    exit /b 1
)

echo [1/5] Arret des processus cloudflared existants...
taskkill /F /IM cloudflared.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo    OK

echo [2/5] Desinstallation de l'ancien service (si existe)...
net stop cloudflared >nul 2>&1
sc delete cloudflared >nul 2>&1
timeout /t 2 /nobreak >nul
echo    OK

echo [3/5] Installation du service avec la configuration...
set CONFIG_PATH=%~dp0\..\cloudflare-active-config.yml
if not exist "%CONFIG_PATH%" (
    echo [ERREUR] Fichier de configuration introuvable : %CONFIG_PATH%
    pause
    exit /b 1
)

cloudflared service install --config "%CONFIG_PATH%"
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de l'installation du service
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
echo    OK

echo [4/5] Configuration du demarrage automatique...
sc config cloudflared start= auto
if %errorlevel% neq 0 (
    echo [ERREUR] Echec de la configuration du demarrage automatique
    pause
    exit /b 1
)
echo    OK

echo [5/5] Demarrage du service...
net start cloudflared
if %errorlevel% neq 0 (
    echo [ERREUR] Echec du demarrage du service
    pause
    exit /b 1
)
timeout /t 3 /nobreak >nul
echo    OK

echo.
echo ========================================
echo   Installation terminee avec succes !
echo ========================================
echo.
echo Le service Cloudflare Tunnel est maintenant :
echo   - Installe comme service Windows
echo   - Configure pour demarrer automatiquement
echo   - En cours d'execution
echo.
echo Commandes utiles :
echo   - Verifier le statut : sc query cloudflared
echo   - Demarrer : net start cloudflared
echo   - Arreter : net stop cloudflared
echo   - Redemarrer : net stop cloudflared ^&^& net start cloudflared
echo.
echo Vous pouvez aussi utiliser les Services Windows :
echo   Win+R -^> services.msc -^> chercher "cloudflared"
echo.
pause














