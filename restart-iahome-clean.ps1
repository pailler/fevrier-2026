# Script de nettoyage et redémarrage d'iahome
# Ce script arrête les services, vide les caches et redémarre iahome

Write-Host "🔄 Redémarrage d'iahome avec nettoyage des caches..." -ForegroundColor Cyan

# 1. Arrêter les services Docker
Write-Host "⏹️ Arrêt des services Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer les caches Docker
Write-Host "🧹 Nettoyage des caches Docker..." -ForegroundColor Yellow
docker system prune -f
docker volume prune -f
docker image prune -f

# 3. Vérifier et arrêter les processus sur le port 3000
Write-Host "🔍 Vérification du port 3000..." -ForegroundColor Yellow
$processes = netstat -ano | findstr :3000
if ($processes) {
    Write-Host "⚠️ Processus détectés sur le port 3000, arrêt en cours..." -ForegroundColor Red
    $pids = ($processes | ForEach-Object { ($_ -split '\s+')[4] } | Sort-Object -Unique)
    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            try {
                taskkill /PID $pid /F
                Write-Host "✅ Processus $pid arrêté" -ForegroundColor Green
            } catch {
                Write-Host "❌ Impossible d'arrêter le processus $pid" -ForegroundColor Red
            }
        }
    }
}

# 4. Reconstruire l'application Next.js
Write-Host "🔨 Reconstruction de l'application Next.js..." -ForegroundColor Yellow
npm run build

# 5. Redémarrer les services Docker
Write-Host "🚀 Redémarrage des services Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# 6. Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 7. Vérifier le statut des services
Write-Host "📊 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# 8. Tester l'accessibilité
Write-Host "🌐 Test d'accessibilité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ iahome est accessible sur http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "⚠️ iahome répond avec le code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ iahome n'est pas accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# 9. Afficher les logs récents
Write-Host "📋 Logs récents des services:" -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml logs --tail=10

Write-Host "🎉 Redémarrage terminé !" -ForegroundColor Green
Write-Host "🌐 Accédez à iahome sur: http://localhost:3000" -ForegroundColor Cyan
