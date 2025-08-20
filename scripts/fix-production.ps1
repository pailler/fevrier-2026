# Script de correction pour la production iahome.fr
Write-Host "🔧 Correction des problèmes de production pour iahome.fr" -ForegroundColor Cyan

# 1. Arrêter les services
Write-Host "`n🛑 Arrêt des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer les conteneurs
Write-Host "`n🧹 Nettoyage des conteneurs..." -ForegroundColor Yellow
docker system prune -f

# 3. Reconstruire l'image
Write-Host "`n🔨 Reconstruction de l'image..." -ForegroundColor Yellow
docker build -t iahome:latest .

# 4. Vérifier les variables d'environnement
Write-Host "`n⚙️ Vérification des variables d'environnement..." -ForegroundColor Yellow
if (Test-Path "env.production.local") {
    Write-Host "✅ Fichier env.production.local trouvé" -ForegroundColor Green
    Get-Content "env.production.local" | Select-String -Pattern "NEXT_PUBLIC_|NODE_ENV"
} else {
    Write-Host "❌ Fichier env.production.local manquant" -ForegroundColor Red
    Write-Host "Création d'un fichier .env.production..." -ForegroundColor Yellow
    Copy-Item "env.production.example" ".env.production" -ErrorAction SilentlyContinue
}

# 5. Redémarrer les services
Write-Host "`n🚀 Redémarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# 6. Attendre que les services soient prêts
Write-Host "`n⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# 7. Vérifier le statut
Write-Host "`n📊 Statut des services:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# 8. Vérifier les logs
Write-Host "`n📋 Logs récents:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail 20

Write-Host "`n✅ Correction terminée" -ForegroundColor Green
Write-Host "🌐 Vérifiez l'application sur https://iahome.fr" -ForegroundColor Cyan
