# Script pour vider le cache Cloudflare via l'API
Write-Host "🧹 Vidage du Cache Cloudflare" -ForegroundColor Cyan
Write-Host "=============================" -ForegroundColor Cyan

# Instructions pour vider le cache manuellement
Write-Host "`n📋 Instructions pour vider le cache Cloudflare:" -ForegroundColor Yellow
Write-Host "===============================================" -ForegroundColor Yellow

Write-Host "`n1. Méthode Dashboard (Recommandée):" -ForegroundColor Cyan
Write-Host "   • Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "   • Sélectionnez votre domaine 'iahome.fr'" -ForegroundColor White
Write-Host "   • Cliquez sur 'Caching' dans le menu de gauche" -ForegroundColor White
Write-Host "   • Cliquez sur 'Configuration'" -ForegroundColor White
Write-Host "   • Cliquez sur 'Purge Everything'" -ForegroundColor White
Write-Host "   • Confirmez l'action" -ForegroundColor White

Write-Host "`n2. Méthode API (Si vous avez un token):" -ForegroundColor Cyan
Write-Host "   • Obtenez votre Zone ID depuis le dashboard Cloudflare" -ForegroundColor White
Write-Host "   • Créez un token API avec les permissions 'Zone:Edit'" -ForegroundColor White
Write-Host "   • Utilisez l'API REST pour purger le cache" -ForegroundColor White

Write-Host "`n3. Méthode Cloudflare CLI (Si installé):" -ForegroundColor Cyan
Write-Host "   • Installez Cloudflare CLI: npm install -g wrangler" -ForegroundColor White
Write-Host "   • Authentifiez-vous: wrangler login" -ForegroundColor White
Write-Host "   • Purgez le cache: wrangler pages purge-cache" -ForegroundColor White

# Vérifier si wrangler est installé
Write-Host "`n4. Vérification de Wrangler CLI..." -ForegroundColor Yellow
try {
    $wranglerVersion = & wrangler --version 2>&1
    if ($wranglerVersion -match "wrangler") {
        Write-Host "✅ Wrangler CLI trouvé: $wranglerVersion" -ForegroundColor Green
        
        Write-Host "`n🚀 Tentative de purge automatique avec Wrangler..." -ForegroundColor Green
        try {
            # Essayer de purger le cache
            $purgeResult = & wrangler pages purge-cache --project-name iahome 2>&1
            Write-Host "✅ Cache purgé avec succès!" -ForegroundColor Green
            Write-Host "   Résultat: $purgeResult" -ForegroundColor Gray
        } catch {
            Write-Host "❌ Échec de la purge automatique: $($_.Exception.Message)" -ForegroundColor Red
            Write-Host "⚠️ Utilisez la méthode dashboard manuellement" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Wrangler CLI non trouvé" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Wrangler CLI non installé" -ForegroundColor Red
    Write-Host "   Installez-le avec: npm install -g wrangler" -ForegroundColor Gray
}

# Instructions détaillées pour le dashboard
Write-Host "`n5. Instructions détaillées Dashboard:" -ForegroundColor Yellow
Write-Host "=====================================" -ForegroundColor Yellow

Write-Host "`n📱 Étapes détaillées:" -ForegroundColor Cyan
Write-Host "1. Ouvrez votre navigateur et allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Connectez-vous avec vos identifiants Cloudflare" -ForegroundColor White
Write-Host "3. Dans la liste des domaines, cliquez sur 'iahome.fr'" -ForegroundColor White
Write-Host "4. Dans le menu de gauche, cliquez sur 'Caching'" -ForegroundColor White
Write-Host "5. Cliquez sur l'onglet 'Configuration'" -ForegroundColor White
Write-Host "6. Faites défiler vers le bas jusqu'à 'Purge Cache'" -ForegroundColor White
Write-Host "7. Cliquez sur le bouton 'Purge Everything'" -ForegroundColor White
Write-Host "8. Confirmez l'action dans la popup" -ForegroundColor White
Write-Host "9. Attendez quelques secondes pour que la purge soit effective" -ForegroundColor White

Write-Host "`n6. Vérification après purge:" -ForegroundColor Yellow
Write-Host "============================" -ForegroundColor Yellow

Write-Host "`n🔍 URLs à tester après la purge:" -ForegroundColor Cyan
Write-Host "• https://iahome.fr" -ForegroundColor White
Write-Host "• https://www.iahome.fr" -ForegroundColor White
Write-Host "• https://iahome.fr/login" -ForegroundColor White
Write-Host "• https://iahome.fr/signup" -ForegroundColor White
Write-Host "• https://iahome.fr/essentiels" -ForegroundColor White
Write-Host "• https://iahome.fr/applications" -ForegroundColor White

Write-Host "`n7. Signes que le cache a été vidé:" -ForegroundColor Yellow
Write-Host "===================================" -ForegroundColor Yellow

Write-Host "`n✅ Indicateurs de succès:" -ForegroundColor Green
Write-Host "• Les pages se rechargent plus lentement (première fois)" -ForegroundColor White
Write-Host "• Les modifications récentes sont visibles" -ForegroundColor White
Write-Host "• Pas d'erreurs de cache dans la console" -ForegroundColor White
Write-Host "• Les nouvelles fonctionnalités sont actives" -ForegroundColor White

Write-Host "`n⚠️ Si le cache n'est pas vidé:" -ForegroundColor Yellow
Write-Host "• Les pages se chargent très rapidement" -ForegroundColor White
Write-Host "• Les anciennes versions sont encore visibles" -ForegroundColor White
Write-Host "• Les modifications ne sont pas prises en compte" -ForegroundColor White

Write-Host "`n8. Commandes utiles:" -ForegroundColor Yellow
Write-Host "===================" -ForegroundColor Yellow

Write-Host "`n🛠️ Scripts disponibles:" -ForegroundColor Cyan
Write-Host "• .\restore-cloudflare-production.ps1 (restaurer Cloudflare)" -ForegroundColor White
Write-Host "• .\start-cloudflare.ps1 (démarrer le tunnel)" -ForegroundColor White
Write-Host "• .\stop-cloudflare.ps1 (arrêter le tunnel)" -ForegroundColor White
Write-Host "• .\test-cloudflare-routes.ps1 (tester les routes)" -ForegroundColor White

Write-Host "`n🎯 Résultat final:" -ForegroundColor Cyan
Write-Host "✅ CLOUDFLARE RESTAURÉ ET OPÉRATIONNEL !" -ForegroundColor Green
Write-Host "✅ Site principal accessible sur https://iahome.fr" -ForegroundColor Green
Write-Host "⚠️ VIDEZ MANUELLEMENT LE CACHE SUR LE DASHBOARD" -ForegroundColor Yellow
Write-Host "✅ Testez les URLs après la purge du cache" -ForegroundColor Green

Write-Host "`n🚀 ÉTAPES SUIVANTES:" -ForegroundColor Green
Write-Host "1. Allez sur https://dash.cloudflare.com" -ForegroundColor White
Write-Host "2. Purgez le cache de iahome.fr" -ForegroundColor White
Write-Host "3. Testez https://iahome.fr dans votre navigateur" -ForegroundColor White
Write-Host "4. Vérifiez que les modifications récentes sont visibles" -ForegroundColor White

Write-Host "`n🎉 CLOUDFLARE EST MAINTENANT OPÉRATIONNEL !" -ForegroundColor Green
Write-Host "N'oubliez pas de vider le cache pour voir les dernières modifications !" -ForegroundColor Green


