# Script simplifie pour demarrer Blender 3D v2.0

Write-Host "Demarrage de Blender 3D v2.0" -ForegroundColor Green

# Copier l'API amelioree
if (Test-Path "blender-api/api_server_enhanced.py") {
    Write-Host "Copie de l'API amelioree..." -ForegroundColor Yellow
    Copy-Item "blender-api/api_server_enhanced.py" "blender-api/api_server.py" -Force
    Write-Host "API amelioree copiee" -ForegroundColor Green
}

# Creer les dossiers
$folders = @("blender-output", "blender-temp", "blender-api/temp", "blender-api/output")
foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "Dossier cree: $folder" -ForegroundColor Green
    }
}

# Demarrer les services
Write-Host "Demarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.blender.yml down
docker-compose -f docker-compose.blender.yml up -d

Write-Host "Attente du demarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Verifier le statut
Write-Host "Statut des services:" -ForegroundColor Yellow
docker-compose -f docker-compose.blender.yml ps

Write-Host ""
Write-Host "Services demarres !" -ForegroundColor Green
Write-Host "Interface Web: http://localhost:9091" -ForegroundColor Cyan
Write-Host "API Flask: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Next.js App: http://localhost:3000/blender-3d" -ForegroundColor Cyan
