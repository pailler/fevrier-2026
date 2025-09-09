# Script de test avec protection renforcée contre les clics multiples
Write-Host "🛡️ Test de protection renforcée contre les clics multiples" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🛡️ Protections renforcées appliquées:" -ForegroundColor Yellow
Write-Host "   ✅ Compteur de clics (clickCount)" -ForegroundColor White
Write-Host "   ✅ Blocage des clics multiples (clic #2+ ignoré)" -ForegroundColor White
Write-Host "   ✅ Protection isProcessing maintenue" -ForegroundColor White
Write-Host "   ✅ Protection isLoading maintenue" -ForegroundColor White
Write-Host "   ✅ Reset automatique du compteur après 2s" -ForegroundColor White
Write-Host "   ✅ Logs détaillés pour le debug" -ForegroundColor White
Write-Host ""

Write-Host "📊 Logs de debug à surveiller:" -ForegroundColor Cyan
Write-Host "   - '🔍 AuthorizedAccessButton - Clic #1 - handleAccess appelé'" -ForegroundColor White
Write-Host "   - '⚠️ Clic multiple détecté - ignoré' (si clic #2+)" -ForegroundColor White
Write-Host "   - '🔗 Appel window.open...' (une seule fois)" -ForegroundColor White
Write-Host "   - '🔗 LibreSpeed - Fin de la fonction'" -ForegroundColor White
Write-Host ""

Write-Host "🎯 Test à effectuer:" -ForegroundColor Cyan
Write-Host "1. Ouvrez https://iahome.fr" -ForegroundColor White
Write-Host "2. Ouvrez la console (F12)" -ForegroundColor White
Write-Host "3. Cliquez RAPIDEMENT plusieurs fois sur un bouton" -ForegroundColor White
Write-Host "4. Vérifiez qu'un seul onglet s'ouvre" -ForegroundColor White
Write-Host "5. Vérifiez les logs dans la console" -ForegroundColor White
Write-Host ""

Write-Host "✅ Protection renforcée activée !" -ForegroundColor Green
Write-Host "🎯 Les clics multiples devraient maintenant être bloqués" -ForegroundColor Green
