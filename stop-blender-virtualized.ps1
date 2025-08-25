# Script d'arrêt pour Blender virtualisé depuis la racine
Write-Host "🛑 Arrêt de Blender virtualisé..." -ForegroundColor Yellow

# Aller dans le dossier docker-services
Set-Location "docker-services"

# Exécuter le script d'arrêt
.\stop-blender.ps1

# Revenir à la racine
Set-Location ".."

Write-Host "✅ Blender virtualisé arrêté" -ForegroundColor Green

