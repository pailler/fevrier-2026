@echo off
echo ========================================
echo  Réparation Cloudflare Meeting Reports
echo ========================================
echo.

echo 1. Arrêt des processus existants...
taskkill /f /im node.exe 2>nul
taskkill /f /im cloudflared.exe 2>nul
taskkill /f /im python.exe 2>nul
timeout /t 3 /nobreak >nul

echo 2. Démarrage Backend (uvicorn direct)...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\backend
start "Backend Meeting Reports" cmd /k "python -m uvicorn main-simple:app --host 0.0.0.0 --port 8001 --reload"

echo 3. Attente de 15 secondes...
timeout /t 15 /nobreak >nul

echo 4. Test du backend...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:8001/health' -TimeoutSec 5 | Out-Null; Write-Host 'Backend OK' } catch { Write-Host 'Backend ERREUR' }"

echo 5. Démarrage Frontend (configuration domaine)...
cd /d C:\Users\AAA\Documents\iahome\meeting-reports\frontend
start "Frontend Meeting Reports" cmd /k "npm run start:domain"

echo 6. Attente de 20 secondes...
timeout /t 20 /nobreak >nul

echo 7. Test du frontend...
powershell -Command "try { Invoke-WebRequest -Uri 'http://localhost:3050' -TimeoutSec 5 | Out-Null; Write-Host 'Frontend OK' } catch { Write-Host 'Frontend ERREUR' }"

echo 8. Démarrage Cloudflare...
cd /d C:\Users\AAA\Documents\iahome
start "Cloudflare Tunnel" cmd /k "cloudflared tunnel --config cloudflare-complete-config.yml run"

echo 9. Attente de 15 secondes...
timeout /t 15 /nobreak >nul

echo 10. Test du domaine...
powershell -Command "try { Invoke-WebRequest -Uri 'https://meeting-reports.iahome.fr' -TimeoutSec 10 | Out-Null; Write-Host 'Domaine OK' } catch { Write-Host 'Domaine ERREUR' }"

echo.
echo ========================================
echo  Réparation terminée !
echo ========================================
echo.
echo URLs:
echo   Frontend: http://localhost:3050
echo   Backend:  http://localhost:8001
echo   Domaine:  https://meeting-reports.iahome.fr
echo.
pause
