@echo off
echo ========================================
echo  Démarrage Frontend - Configuration Propre
echo ========================================
echo.

cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

echo 1. Installation des dépendances...
call npm install

echo 2. Configuration des variables d'environnement...
set PORT=3050
set PUBLIC_URL=https://meeting-reports.iahome.fr
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set WDS_SOCKET_HOST=localhost
set DANGEROUSLY_DISABLE_HOST_CHECK=true

echo 3. Démarrage du serveur de développement...
echo.
echo URLs:
echo   Local: http://localhost:3050
echo   Production: https://meeting-reports.iahome.fr
echo.

call npm start
