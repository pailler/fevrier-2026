# Script de demarrage pour Blender virtualise
Write-Host "Demarrage de Blender virtualise..." -ForegroundColor Green

# Verifier si Docker est installe
try {
    docker --version | Out-Null
    Write-Host "Docker detecte" -ForegroundColor Green
} catch {
    Write-Host "Docker non trouve. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Creer les dossiers necessaires
Write-Host "Creation des dossiers..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "blender-temp" | Out-Null

# Demarrer les services Docker
Write-Host "Demarrage des services Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.blender.yml up -d

# Attendre que les services soient prets
Write-Host "Attente du demarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Verifier le statut des services
Write-Host "Verification du statut des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.blender.yml ps

# Tester l'interface web Blender
Write-Host "Test de l'interface web Blender..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:9091" -Method GET -TimeoutSec 5
    Write-Host "Interface web Blender operationnelle" -ForegroundColor Green
} catch {
    Write-Host "Interface web Blender non accessible (peut prendre quelques secondes)" -ForegroundColor Yellow
}

Write-Host "Blender virtualise pret !" -ForegroundColor Green
Write-Host "URLs disponibles:" -ForegroundColor Cyan
Write-Host "   - Interface Web Blender: http://localhost:9091" -ForegroundColor White
Write-Host "   - API Blender: http://localhost:3001" -ForegroundColor White
Write-Host "   - Next.js App: http://localhost:3000/blender-3d" -ForegroundColor White

Write-Host "Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Arreter: docker-compose -f docker-compose.blender.yml down" -ForegroundColor White
Write-Host "   - Logs: docker-compose -f docker-compose.blender.yml logs -f" -ForegroundColor White
Write-Host "   - Redemarrer: docker-compose -f docker-compose.blender.yml restart" -ForegroundColor White
