@echo off
REM Script simple pour installer Cloudflare Tunnel comme service Windows
REM Emplacement : scripts/installer-cloudflare-service.bat
REM Double-cliquez sur ce fichier pour lancer l'installation

echo ========================================
echo   Installation Cloudflare Tunnel
echo   Service Windows avec demarrage auto
echo ========================================
echo.
echo Ce script va demander les droits administrateur...
echo.

cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0install-cloudflare-auto-start.ps1"

pause














