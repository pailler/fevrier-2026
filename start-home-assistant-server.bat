@echo off
REM Script de lancement pour démarrer Home Assistant
REM Ce script appelle le script principal dans scripts/

cd /d "%~dp0"
call scripts\start-home-assistant-server.bat
