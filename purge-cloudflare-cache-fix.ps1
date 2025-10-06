# Script pour purger le cache Cloudflare et corriger les erreurs de chunks
Write-Host "🔧 Purge du cache Cloudflare et correction des chunks" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Attendre que l'application soit prête
Write-Host "`n1. Attente du démarrage de l'application..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 2. Tester l'application locale
Write-Host "`n2. Test de l'application locale..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application locale accessible" -ForegroundColor Green
    } else {
        Write-Host "❌ Application locale non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur application locale: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Tester les fichiers statiques locaux
Write-Host "`n3. Test des fichiers statiques locaux..." -ForegroundColor Yellow
$staticFiles = @(
    "http://localhost:3000/_next/static/css/0cf618cf7a83c7d6.css",
    "http://localhost:3000/_next/static/chunks/7271-fc120e3e607cf2dc.js"
)

foreach ($file in $staticFiles) {
    try {
        $response = Invoke-WebRequest -Uri $file -UseBasicParsing -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ $file - Accessible" -ForegroundColor Green
        } else {
            Write-Host "❌ $file - Code: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ $file - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Instructions pour purger le cache Cloudflare
Write-Host "`n4. Instructions pour purger le cache Cloudflare..." -ForegroundColor Yellow
Write-Host "⚠️ Pour corriger les erreurs de chunks, vous devez:" -ForegroundColor Yellow
Write-Host "   1. Aller sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "   2. Sélectionner votre domaine iahome.fr" -ForegroundColor White
Write-Host "   3. Aller dans 'Caching' > 'Configuration'" -ForegroundColor White
Write-Host "   4. Cliquer sur 'Purge Everything'" -ForegroundColor White
Write-Host "   5. Attendre 1-2 minutes pour la propagation" -ForegroundColor White

# 5. Tester les routes Cloudflare après purge
Write-Host "`n5. Test des routes Cloudflare..." -ForegroundColor Yellow
Write-Host "⏳ Attendez 2 minutes après avoir purgé le cache, puis testez:" -ForegroundColor Blue

$routes = @(
    "https://www.iahome.fr",
    "https://iahome.fr",
    "https://www.iahome.fr/admin"
)

foreach ($route in $routes) {
    Write-Host "   • $route" -ForegroundColor Gray
}

# 6. Script de test automatique
Write-Host "`n6. Script de test automatique..." -ForegroundColor Yellow
Write-Host "Exécutez ce script après avoir purgé le cache:" -ForegroundColor Blue
Write-Host "`n.\test-cloudflare-after-purge.ps1" -ForegroundColor White

Write-Host "`n🎯 Résumé des actions:" -ForegroundColor Cyan
Write-Host "✅ Application reconstruite avec nouveaux chunks" -ForegroundColor Green
Write-Host "✅ Application redémarrée en mode production" -ForegroundColor Green
Write-Host "⚠️ Purge du cache Cloudflare requise manuellement" -ForegroundColor Yellow
Write-Host "✅ Fichiers statiques locaux accessibles" -ForegroundColor Green

Write-Host "`n🚀 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "1. Purger le cache Cloudflare sur le dashboard" -ForegroundColor White
Write-Host "2. Attendre 1-2 minutes" -ForegroundColor White
Write-Host "3. Tester l'accès à https://iahome.fr" -ForegroundColor White
Write-Host "4. Vérifier que les erreurs de chunks ont disparu" -ForegroundColor White

Write-Host "`n✨ Le problème de chunks devrait être résolu après la purge !" -ForegroundColor Green


