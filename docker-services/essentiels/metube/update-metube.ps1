# Script de mise à jour de MeTube et yt-dlp
# Ce script met à jour l'image Docker MeTube et force la mise à jour de yt-dlp

Write-Host "🔧 Mise à jour de MeTube et yt-dlp" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan

# Aller dans le répertoire du script
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

Write-Host "`n📥 Mise à jour de l'image Docker MeTube..." -ForegroundColor Yellow
docker pull alexta69/metube:latest

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du pull de l'image Docker" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Image Docker mise à jour avec succès" -ForegroundColor Green

Write-Host "`n🛑 Arrêt du conteneur MeTube..." -ForegroundColor Yellow
docker-compose down

Write-Host "`n🚀 Démarrage du conteneur MeTube avec la nouvelle image..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du démarrage du conteneur" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Conteneur MeTube redémarré avec succès" -ForegroundColor Green

# Attendre que le conteneur soit prêt
Write-Host "`n⏳ Attente du démarrage du conteneur (10 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "`n🔄 Mise à jour de yt-dlp dans le conteneur..." -ForegroundColor Yellow
docker exec -it metube-iahome pip install --upgrade yt-dlp

if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Erreur lors de la mise à jour de yt-dlp, tentative alternative..." -ForegroundColor Yellow
    # Tentative alternative : mise à jour via pip3 ou python3
    docker exec -it metube-iahome pip3 install --upgrade yt-dlp
    if ($LASTEXITCODE -ne 0) {
        docker exec -it metube-iahome python3 -m pip install --upgrade yt-dlp
    }
}

Write-Host "`n📊 Vérification de la version de yt-dlp..." -ForegroundColor Yellow
docker exec -it metube-iahome yt-dlp --version

Write-Host "`n✅ Mise à jour de MeTube terminée !" -ForegroundColor Green
Write-Host "`n📋 Statut du conteneur:" -ForegroundColor Cyan
docker ps --filter name=metube-iahome --format "table {{.Names}}\t{{.Status}}\t{{.Image}}"

Write-Host "`n💡 Pour voir les logs du conteneur, utilisez:" -ForegroundColor Yellow
Write-Host "   docker logs -f metube-iahome" -ForegroundColor Gray

