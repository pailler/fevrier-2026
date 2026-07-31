@echo off
cd /d "%~dp0.."
powershell -ExecutionPolicy Bypass -Command "Start-Process powershell -ArgumentList '-ExecutionPolicy Bypass -NoExit -File \"%~dp0fix-reveil-tunnel-origin.ps1\"' -Verb RunAs"
