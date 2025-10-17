@echo off
echo Démarrage direct du frontend...

cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend

set PORT=3001
set HOST=localhost
set DANGEROUSLY_DISABLE_HOST_CHECK=true
set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api
set PUBLIC_URL=https://meeting-reports.iahome.fr

echo Configuration:
echo   PORT: %PORT%
echo   HOST: %HOST%
echo   API_URL: %REACT_APP_API_URL%
echo   PUBLIC_URL: %PUBLIC_URL%

echo.
echo Démarrage de React...
npm start
