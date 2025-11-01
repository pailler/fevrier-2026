# Script pour redémarrer le backend avec support des gros fichiers
# Ce script reconstruit l'image Docker avec les nouvelles configurations

Write-Host "🔄 Redémarrage du backend Meeting Reports avec support des gros fichiers..." -ForegroundColor Cyan

# Aller dans le répertoire meeting-reports
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptPath

# Arrêter les conteneurs existants
Write-Host "`n⏹️  Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose down

# Reconstruire l'image backend avec les nouvelles dépendances (hypercorn, aiofiles)
Write-Host "`n🔨 Reconstruction de l'image backend..." -ForegroundColor Yellow
docker-compose build backend

# Redémarrer tous les services
Write-Host "`n🚀 Démarrage des services..." -ForegroundColor Green
docker-compose up -d

Write-Host "`n✅ Services redémarrés avec succès!" -ForegroundColor Green
Write-Host "`n📋 Vérification du statut:" -ForegroundColor Cyan
docker-compose ps

Write-Host "`n🔍 Vérification des logs du backend:" -ForegroundColor Cyan
Write-Host "(Attendez 10 secondes puis vérifiez les logs)" -ForegroundColor Gray
Start-Sleep -Seconds 10
docker-compose logs --tail=50 backend

Write-Host "`n✅ Backend redémarré avec support des fichiers jusqu'à 500MB!" -ForegroundColor Green
Write-Host "   - Hypercorn configuré avec max-incomplete-size: 524288000 (500MB)" -ForegroundColor Gray
Write-Host "   - Upload streaming avec aiofiles pour éviter la saturation mémoire" -ForegroundColor Gray
Write-Host "   - Timeouts étendus pour les gros fichiers" -ForegroundColor Gray

