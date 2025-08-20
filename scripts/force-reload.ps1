# Script pour forcer un rechargement complet de l'application
Write-Host "🔄 Forçage du rechargement complet..." -ForegroundColor Cyan

# 1. Arrêter les services
Write-Host "`n1. Arrêt des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# 2. Nettoyer les images
Write-Host "`n2. Nettoyage des images..." -ForegroundColor Yellow
docker system prune -f

# 3. Reconstruire l'image
Write-Host "`n3. Reconstruction de l'image..." -ForegroundColor Yellow
docker build -t iahome:latest . --no-cache

# 4. Redémarrer les services
Write-Host "`n4. Redémarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# 5. Attendre que l'application soit prête
Write-Host "`n5. Attente du démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 6. Tester l'application
Write-Host "`n6. Test de l'application..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/card/librespeed" -Method Head -TimeoutSec 10
    Write-Host "✅ Application accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Instructions pour voir les modifications:" -ForegroundColor Cyan
Write-Host "1. Videz le cache du navigateur (Ctrl + Shift + R)" -ForegroundColor White
Write-Host "2. Allez sur: http://localhost:3000/card/librespeed" -ForegroundColor White
Write-Host "3. Ou en production: https://iahome.fr/card/librespeed" -ForegroundColor White
Write-Host "4. Si ça ne marche pas, ouvrez les outils de développement (F12)" -ForegroundColor White
Write-Host "   → onglet Network → cochez 'Disable cache'" -ForegroundColor White
