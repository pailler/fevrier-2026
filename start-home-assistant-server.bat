@echo off
echo 🏠 Démarrage du serveur Home Assistant...
cd /d "%~dp0essentiels\codes-ha"
echo 📂 Dossier: %CD%
echo 🌐 Démarrage du serveur HTTP sur le port 8123...
echo.
echo ✅ Serveur démarré sur http://localhost:8123
echo 🌐 Production: https://homeassistant.iahome.fr
echo.
echo Appuyez sur Ctrl+C pour arrêter le serveur
echo.
python -m http.server 8123
pause

