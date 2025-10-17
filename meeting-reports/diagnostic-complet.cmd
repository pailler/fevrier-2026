@echo off
echo ========================================
echo   DIAGNOSTIC COMPLET - Meeting Reports
echo ========================================

echo.
echo 1. Vérification des processus...
echo.
tasklist | findstr /i "node python traefik"

echo.
echo 2. Vérification des ports...
echo.
netstat -an | findstr ":300"
netstat -an | findstr ":8001"

echo.
echo 3. Test de connectivité backend...
echo.
curl -s http://localhost:8001/health || echo "Backend non accessible"

echo.
echo 4. Test de connectivité frontend...
echo.
curl -s http://localhost:3001 || echo "Frontend non accessible"

echo.
echo 5. Vérification des répertoires...
echo.
dir "C:\Users\AAA\Documents\iahome\meeting-reports\frontend" | findstr "package.json"
dir "C:\Users\AAA\Documents\iahome\meeting-reports\backend" | findstr "main-simple-working.py"

echo.
echo 6. Test de npm...
echo.
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend
npm --version

echo.
echo ========================================
echo   DIAGNOSTIC TERMINÉ
echo ========================================
pause
