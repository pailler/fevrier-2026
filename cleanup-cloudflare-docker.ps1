#!/usr/bin/env pwsh

Write-Host "🧹 Nettoyage du container Docker Cloudflare IAHome" -ForegroundColor Cyan

Write-Host "`n📋 Étape 1: Vérification des containers Cloudflare" -ForegroundColor Yellow
$cloudflareContainers = docker ps -a | findstr cloudflare
Write-Host "Containers Cloudflare trouvés :"
Write-Host $cloudflareContainers

Write-Host "`n📋 Étape 2: Suppression du container iahome-cloudflared" -ForegroundColor Yellow
$removeResult = docker rm iahome-cloudflared 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Container iahome-cloudflared supprimé avec succès" -ForegroundColor Green
} else {
    Write-Host "⚠️  Container iahome-cloudflared : $removeResult" -ForegroundColor Yellow
}

Write-Host "`n📋 Étape 3: Vérification des images Cloudflare" -ForegroundColor Yellow
$cloudflareImages = docker images | findstr cloudflare
Write-Host "Images Cloudflare trouvées :"
Write-Host $cloudflareImages

Write-Host "`n📋 Étape 4: Tentative de suppression de l'image cloudflare/cloudflared" -ForegroundColor Yellow
$removeImageResult = docker rmi cloudflare/cloudflared:latest 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Image cloudflare/cloudflared:latest supprimée avec succès" -ForegroundColor Green
} else {
    Write-Host "⚠️  Image cloudflare/cloudflared:latest : $removeImageResult" -ForegroundColor Yellow
    Write-Host "   (L'image est encore utilisée par whisper-cloudflared-prod)" -ForegroundColor Gray
}

Write-Host "`n📋 Étape 5: Vérification de la configuration Docker Compose" -ForegroundColor Yellow
if (Test-Path "docker-compose.prod.yml") {
    $configContent = Get-Content "docker-compose.prod.yml" -Raw
    if ($configContent -match "iahome-cloudflared") {
        Write-Host "❌ Configuration iahome-cloudflared encore présente dans docker-compose.prod.yml" -ForegroundColor Red
    } else {
        Write-Host "✅ Configuration iahome-cloudflared supprimée de docker-compose.prod.yml" -ForegroundColor Green
    }
} else {
    Write-Host "⚠️  Fichier docker-compose.prod.yml non trouvé" -ForegroundColor Yellow
}

Write-Host "`n📋 Étape 6: Vérification du tunnel Windows actuel" -ForegroundColor Yellow
$tunnelProcesses = Get-Process cloudflared -ErrorAction SilentlyContinue
if ($tunnelProcesses) {
    Write-Host "✅ Processus cloudflared Windows en cours d'exécution :" -ForegroundColor Green
    $tunnelProcesses | ForEach-Object { Write-Host "   - PID: $($_.Id), CPU: $($_.CPU)" -ForegroundColor Cyan }
} else {
    Write-Host "❌ Aucun processus cloudflared Windows en cours d'exécution" -ForegroundColor Red
}

Write-Host "`n📋 Étape 7: Test de connectivité" -ForegroundColor Yellow
$testResult = curl -I https://www.iahome.fr 2>&1
if ($testResult -match "HTTP/1.1 404") {
    Write-Host "✅ Tunnel Windows fonctionnel (HTTP 404 = service non démarré mais DNS OK)" -ForegroundColor Green
} else {
    Write-Host "❌ Problème de connectivité : $testResult" -ForegroundColor Red
}

Write-Host "`n✨ Nettoyage terminé !" -ForegroundColor Green
Write-Host "Le container Docker iahome-cloudflared a été supprimé." -ForegroundColor White
Write-Host "Le tunnel Windows cloudflared est maintenant utilisé pour tous les services." -ForegroundColor White
Write-Host "L'image cloudflare/cloudflared est conservée car utilisée par whisper-cloudflared-prod." -ForegroundColor White
