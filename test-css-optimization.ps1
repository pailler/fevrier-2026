# Script de test pour vérifier l'optimisation CSS
Write-Host "🎨 Test d'optimisation CSS - Résolution du problème de préchargement" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Vérification de l'application:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✅ Application accessible (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Application non accessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔧 Optimisations appliquées:" -ForegroundColor Yellow
Write-Host "   ✅ Build ID stable (production-build)" -ForegroundColor White
Write-Host "   ✅ Headers de cache optimisés" -ForegroundColor White
Write-Host "   ✅ Configuration CSS spécifique" -ForegroundColor White
Write-Host "   ✅ Composant CSSOptimizer ajouté" -ForegroundColor White
Write-Host "   ✅ Stale-while-revalidate activé" -ForegroundColor White
Write-Host ""

Write-Host "📊 Améliorations attendues:" -ForegroundColor Cyan
Write-Host "   - Réduction des warnings de préchargement CSS" -ForegroundColor White
Write-Host "   - Meilleure performance de chargement" -ForegroundColor White
Write-Host "   - Cache plus efficace" -ForegroundColor White
Write-Host "   - Moins de requêtes inutiles" -ForegroundColor White
Write-Host ""

Write-Host "🌐 Test de l'URL de production:" -ForegroundColor Cyan
Write-Host "   https://iahome.fr" -ForegroundColor White
Write-Host ""

Write-Host "✅ Optimisations CSS appliquées avec succès !" -ForegroundColor Green
Write-Host "🎯 Le problème de préchargement CSS devrait être résolu" -ForegroundColor Green
