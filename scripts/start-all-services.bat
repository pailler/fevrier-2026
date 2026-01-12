@echo off
REM Script de lancement pour démarrer tous les services IAHome
REM Ce script appelle le script principal dans scripts/

cd /d "%~dp0"
powershell.exe -ExecutionPolicy Bypass -File "%~dp0scripts\start-all-services.ps1" %*














