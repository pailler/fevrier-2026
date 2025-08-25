# Script de demarrage pour Blender virtualise depuis la racine
Write-Host "Demarrage de Blender virtualise..." -ForegroundColor Green

# Aller dans le dossier docker-services
Set-Location "docker-services"

# Executer le script de demarrage
.\start-blender.ps1

# Revenir a la racine
Set-Location ".."

Write-Host "Blender virtualise demarre depuis docker-services !" -ForegroundColor Green
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "   - Interface Web Blender: http://localhost:9091" -ForegroundColor White
Write-Host "   - API Blender: http://localhost:3001" -ForegroundColor White
Write-Host "   - Next.js App: http://localhost:3000/blender-3d" -ForegroundColor White
