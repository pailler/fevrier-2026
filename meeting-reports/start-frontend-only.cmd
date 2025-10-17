@echo off
echo Démarrage du Frontend uniquement...
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

npm start
