@echo off
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoExit -File \"%~dp0sync-reveil-cloudflare-tunnel.ps1\"' -Verb RunAs"
