@echo off
echo Démarrage du Frontend sur port 3002...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

set PORT=3002
set HOST=localhost
set WDS_SOCKET_HOST=localhost
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set PUBLIC_URL=https://meeting-reports.iahome.fr

echo Configuration:
echo   PORT: %PORT%
echo   HOST: %HOST%
echo   API_URL: %REACT_APP_API_URL%

echo.
echo Démarrage de React sur port 3002...
npm start
