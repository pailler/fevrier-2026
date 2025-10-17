@echo off
echo Démarrage simple de Meeting Reports Generator...

REM Démarrer le backend
echo Démarrage du backend...
start cmd /k "cd backend && python main-simple-working.py"

REM Attendre un peu
timeout /t 5 /nobreak > nul

REM Démarrer le frontend
echo Démarrage du frontend...
start cmd /k "cd frontend && set PORT=3001 && set HOST=localhost && set DANGEROUSLY_DISABLE_HOST_CHECK=true && set REACT_APP_API_URL=https://meeting-reports.iahome.fr/api && set PUBLIC_URL=https://meeting-reports.iahome.fr && npm start"

echo Services démarrés dans des fenêtres séparées.
echo Frontend: http://localhost:3001
echo Backend: http://localhost:8001
echo Production: https://meeting-reports.iahome.fr
pause
