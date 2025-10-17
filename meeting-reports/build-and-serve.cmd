@echo off
echo ========================================
echo   Build et Serve - Meeting Reports
echo ========================================

echo.
echo 1. Build de l'application React...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

set PORT=3001
set HOST=localhost
set WDS_SOCKET_HOST=localhost
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set PUBLIC_URL=https://meeting-reports.iahome.fr

echo Configuration:
echo   PORT: %PORT%
echo   HOST: %HOST%
echo   API_URL: %REACT_APP_API_URL%

echo.
echo Build en cours...
npm run build

echo.
echo 2. Démarrage du serveur de build...
npx serve -s build -l 3001

echo.
echo ========================================
echo   Application disponible sur port 3001
echo ========================================
