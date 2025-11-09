# Script pour reconstruire le conteneur MeTube avec la version la plus récente
# Usage: powershell -ExecutionPolicy Bypass -File rebuild-metube.ps1

Write-Host "🔧 Reconstruction du conteneur MeTube" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Aller dans le répertoire du script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n📥 Téléchargement de la dernière version de l'image MeTube..." -ForegroundColor Yellow
docker pull alexta69/metube:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du pull de l'image Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image Docker mise à jour avec succès" -ForegroundColor Green

Write-Host "`n🛑 Arrêt et suppression du conteneur existant..." -ForegroundColor Yellow
try { docker stop metube-iahome 2>&1 | Out-Null } catch { }
try { docker rm metube-iahome 2>&1 | Out-Null } catch { }

Write-Host "`n🚀 Création du nouveau conteneur MeTube..." -ForegroundColor Yellow
docker compose up -d --force-recreate

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la création du conteneur" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Conteneur MeTube recréé avec succès" -ForegroundColor Green

# Attendre que le conteneur soit prêt
Write-Host "`n⏳ Attente du démarrage du conteneur (20 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Vérifier que le conteneur est en cours d'exécution
$containerStatus = docker ps --filter name=metube-iahome --format "{{.Status}}"
if (-not $containerStatus) {
    Write-Host "❌ Le conteneur MeTube n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "📋 Logs du conteneur:" -ForegroundColor Yellow
    docker logs metube-iahome --tail 50
    exit 1
}

Write-Host "`n📊 Vérification de la version de yt-dlp..." -ForegroundColor Yellow
$ytdlpVersion = docker exec metube-iahome yt-dlp --version 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   Version de yt-dlp: $ytdlpVersion" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Impossible de récupérer la version de yt-dlp" -ForegroundColor Yellow
}

Write-Host "`n✅ Reconstruction de MeTube terminée !" -ForegroundColor Green
Write-Host "`n📋 Statut du conteneur:" -ForegroundColor Cyan
docker ps --filter name=metube-iahome --format "table {{.Names}}\t{{.Status}}\t{{.Image}}\t{{.CreatedAt}}"

Write-Host "`n💡 Pour voir les logs du conteneur, utilisez:" -ForegroundColor Yellow
Write-Host "   docker logs -f metube-iahome" -ForegroundColor Gray


