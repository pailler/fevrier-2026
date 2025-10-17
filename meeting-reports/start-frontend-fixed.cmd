@echo off
echo ========================================
echo   Démarrage Frontend - Configuration Fixée
echo ========================================

cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

echo 1. Configuration des variables d'environnement...
set PORT=3050
set PUBLIC_URL=https://meeting-reports.iahome.fr
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set DANGEROUSLY_DISABLE_HOST_CHECK=true

echo 2. Démarrage du serveur de développement...
echo URLs:
echo   Local: http://localhost:3050
echo   Production: https://meeting-reports.iahome.fr

npm start
