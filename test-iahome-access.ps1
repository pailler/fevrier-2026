#!/usr/bin/env pwsh

Write-Host "🌐 Test d'accessibilité du site IAHome..." -ForegroundColor Cyan

# Test de l'application Next.js directement
Write-Host "`n📦 Test de l'application Next.js (port 3000)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10
    Write-Host "✅ Application Next.js accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Application Next.js inaccessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test via Traefik (port 80)
Write-Host "`n🌐 Test via Traefik (port 80)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -Method Head -TimeoutSec 10
    Write-Host "✅ Traefik accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Traefik inaccessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

# Test avec le nom de domaine
Write-Host "`n🏠 Test avec le nom de domaine..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost" -Headers @{"Host"="iahome.fr"} -Method Head -TimeoutSec 10
    Write-Host "✅ Nom de domaine configuré" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Nom de domaine non configuré" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

# Vérification des conteneurs
Write-Host "`n🐳 Statut des conteneurs..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-String "iahome"
if ($containers) {
    Write-Host "✅ Conteneurs IAHome en cours d'exécution:" -ForegroundColor Green
    $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} else {
    Write-Host "❌ Aucun conteneur IAHome trouvé" -ForegroundColor Red
}

# Test de l'API de santé
Write-Host "`n💚 Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get -TimeoutSec 10
    Write-Host "✅ API de santé fonctionnelle" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
} catch {
    Write-Host "❌ API de santé inaccessible" -ForegroundColor Red
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

Write-Host "`n🎯 Résumé d'accessibilité:" -ForegroundColor Cyan
Write-Host "   Application Next.js: http://localhost:3000" -ForegroundColor Gray
Write-Host "   Traefik: http://localhost" -ForegroundColor Gray
Write-Host "   Nom de domaine: iahome.fr" -ForegroundColor Gray

Write-Host "`n✅ Test d'accessibilité terminé!" -ForegroundColor Green

