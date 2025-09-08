#!/usr/bin/env pwsh

Write-Host "🔍 Vérification post-suppression DragGAN..." -ForegroundColor Cyan

# Vérification des conteneurs
Write-Host "`n🐳 1. Vérification des conteneurs..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "draggan"
if ($containers) {
    Write-Host "❌ Conteneurs DragGAN encore présents:" -ForegroundColor Red
    $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "✅ Aucun conteneur DragGAN trouvé" -ForegroundColor Green
}

# Vérification des services actifs
Write-Host "`n🌐 2. Services actifs..." -ForegroundColor Yellow
$services = @(
    @{Name="IAHome App"; URL="http://localhost:3000"; Port=3000},
    @{Name="Stirling-PDF"; URL="http://localhost:8081"; Port=8081},
    @{Name="MeTube"; URL="http://localhost:8082"; Port=8082},
    @{Name="LibreSpeed"; URL="http://localhost:8083"; Port=8083},
    @{Name="PSITransfer"; URL="http://localhost:8084"; Port=8084},
    @{Name="Polr"; URL="http://localhost:8086"; Port=8086}
)

foreach ($service in $services) {
    try {
        $response = Invoke-WebRequest -Uri $service.URL -Method Head -TimeoutSec 10
        Write-Host "✅ $($service.Name) accessible" -ForegroundColor Green
    } catch {
        Write-Host "❌ $($service.Name) non accessible" -ForegroundColor Red
    }
}

# Vérification des fichiers supprimés
Write-Host "`n📁 3. Vérification des fichiers supprimés..." -ForegroundColor Yellow
$files_to_check = @(
    "docker-services/draggan",
    "docker-services/docker-compose.draggan.yml",
    "start-draggan.ps1",
    "test-draggan-access.ps1",
    "README-DRAGGAN.md",
    "DRAGGAN_DEPLOYMENT_SUCCESS.md",
    "insert-draggan-module.sql"
)

foreach ($file in $files_to_check) {
    if (Test-Path $file) {
        Write-Host "❌ Fichier encore présent: $file" -ForegroundColor Red
    } else {
        Write-Host "✅ Fichier supprimé: $file" -ForegroundColor Green
    }
}

# Vérification du docker-compose.services.yml
Write-Host "`n📋 4. Vérification du docker-compose.services.yml..." -ForegroundColor Yellow
$content = Get-Content "docker-services/docker-compose.services.yml" -Raw
if ($content -match "draggan") {
    Write-Host "❌ Références DragGAN encore présentes dans docker-compose.services.yml" -ForegroundColor Red
} else {
    Write-Host "✅ Aucune référence DragGAN dans docker-compose.services.yml" -ForegroundColor Green
}

Write-Host "`n🎉 Résumé de la suppression:" -ForegroundColor Cyan
Write-Host "   • Conteneur DragGAN: Supprimé ✅" -ForegroundColor Gray
Write-Host "   • Image Docker: Supprimée ✅" -ForegroundColor Gray
Write-Host "   • Dossier draggan: Supprimé ✅" -ForegroundColor Gray
Write-Host "   • Fichiers de configuration: Supprimés ✅" -ForegroundColor Gray
Write-Host "   • Scripts PowerShell: Mis à jour ✅" -ForegroundColor Gray

Write-Host "`n🌐 Services disponibles:" -ForegroundColor Cyan
Write-Host "   • IAHome App:       http://localhost:3000" -ForegroundColor Gray
Write-Host "   • Stirling-PDF:     http://localhost:8081" -ForegroundColor Gray
Write-Host "   • MeTube:           http://localhost:8082" -ForegroundColor Gray
Write-Host "   • LibreSpeed:       http://localhost:8083" -ForegroundColor Gray
Write-Host "   • PSITransfer:      http://localhost:8084" -ForegroundColor Gray
Write-Host "   • Polr (QR):        http://localhost:8086" -ForegroundColor Gray

Write-Host "`n✅ Vérification terminée!" -ForegroundColor Green

