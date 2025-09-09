# Script de debug pour identifier la source du double onglet
Write-Host "🔍 Debug - Identification de la source du double onglet" -ForegroundColor Red
Write-Host ""

Write-Host "📋 Instructions de test:" -ForegroundColor Yellow
Write-Host "1. Ouvrez https://iahome.fr dans votre navigateur" -ForegroundColor White
Write-Host "2. Ouvrez les outils de développement (F12)" -ForegroundColor White
Write-Host "3. Allez dans l'onglet Console" -ForegroundColor White
Write-Host "4. Cliquez sur un bouton d'accès (ex: LibreSpeed)" -ForegroundColor White
Write-Host "5. Observez les messages dans la console" -ForegroundColor White
Write-Host ""

Write-Host "🔍 Messages à rechercher:" -ForegroundColor Cyan
Write-Host "   - '🔗 Ouverture de LibreSpeed dans un nouvel onglet'" -ForegroundColor White
Write-Host "   - '✅ Notification d'accès à l'application envoyée'" -ForegroundColor White
Write-Host "   - 'onAccessGranted' dans la stack trace" -ForegroundColor White
Write-Host "   - 'window.open' dans la stack trace" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Points de vérification:" -ForegroundColor Cyan
Write-Host "   - Combien de fois 'window.open' est appelé ?" -ForegroundColor White
Write-Host "   - Combien de fois 'onAccessGranted' est appelé ?" -ForegroundColor White
Write-Host "   - Y a-t-il des event listeners multiples ?" -ForegroundColor White
Write-Host "   - Y a-t-il des clics multiples détectés ?" -ForegroundColor White
Write-Host ""

Write-Host "📊 Si le problème persiste:" -ForegroundColor Red
Write-Host "   - Copiez les messages de la console" -ForegroundColor White
Write-Host "   - Notez le nombre d'onglets ouverts" -ForegroundColor White
Write-Host "   - Vérifiez si c'est spécifique à certains modules" -ForegroundColor White
Write-Host ""

Write-Host "🌐 URL de test:" -ForegroundColor Green
Write-Host "   https://iahome.fr" -ForegroundColor White
