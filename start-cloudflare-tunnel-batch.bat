@echo off
REM Script de d?marrage automatique de Cloudflare Tunnel
REM G?n?r? automatiquement par setup-cloudflare-autostart-simple.ps1

cd /d "C:\Users\AAA\Documents\iahome"

REM Attendre que Windows soit compl?tement d?marr?
timeout /t 30 /nobreak >nul

REM V?rifier si cloudflared est d?j? en cours d'ex?cution
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Cloudflared est d?j? en cours d'ex?cution
    exit /b 0
)

REM Attendre que les services locaux soient pr?ts
timeout /t 10 /nobreak >nul

REM D?marrer cloudflared en arri?re-plan
start "" /MIN "cloudflared.exe" tunnel --config "cloudflare-active-config.yml" run

REM Attendre un peu pour v?rifier le d?marrage
timeout /t 5 /nobreak >nul

REM V?rifier que le processus a d?marr?
tasklist /FI "IMAGENAME eq cloudflared.exe" 2>NUL | find /I /N "cloudflared.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo Cloudflared d?marr? avec succ?s
) else (
    echo Erreur: Cloudflared n'a pas d?marr?
)
