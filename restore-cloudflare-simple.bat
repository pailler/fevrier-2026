@echo off
chcp 65001 >nul
cd /d "%~dp0"

echo.
echo ========================================
echo   Retablissement Cloudflare Tunnel
echo ========================================
echo.

net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Demande des droits administrateur...
    powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoExit -File \"%~dp0restore-cloudflare-simple.ps1\"' -Verb RunAs"
    exit /b
)

powershell -ExecutionPolicy Bypass -NoExit -File "restore-cloudflare-simple.ps1"








