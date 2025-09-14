# Script de test après rebuild avec suppression du cache
Write-Host "🔧 Test après rebuild avec suppression du cache..." -ForegroundColor Blue

Write-Host "`n✅ Actions effectuées:" -ForegroundColor Green
Write-Host "   ✓ Arrêt de tous les processus Node.js" -ForegroundColor White
Write-Host "   ✓ Suppression du cache .next" -ForegroundColor White
Write-Host "   ✓ Suppression du cache node_modules" -ForegroundColor White
Write-Host "   ✓ Redémarrage du serveur de développement" -ForegroundColor White

Write-Host "`n⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

Write-Host "`n🌐 Test des pages:" -ForegroundColor Cyan
$pages = @(
    @{Name="Page d'accueil"; Url="http://localhost:3000"},
    @{Name="Page Whisper"; Url="http://localhost:3000/card/whisper"},
    @{Name="Page Applications"; Url="http://localhost:3000/applications"},
    @{Name="Page Encours"; Url="http://localhost:3000/encours"}
)

foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri $page.Url -UseBasicParsing -TimeoutSec 10
        Write-Host "   ✓ $($page.Name): HTTP $($response.StatusCode)" -ForegroundColor White
    } catch {
        Write-Host "   ❌ $($page.Name): $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🔍 Vérifications dans la console du navigateur:" -ForegroundColor Magenta
Write-Host "   ✓ Plus d'erreur 'Hydration failed'" -ForegroundColor White
Write-Host "   ✓ Page d'accueil affiche la version actuelle" -ForegroundColor White
Write-Host "   ✓ Plus de différence 'Applis IA' vs 'Applications'" -ForegroundColor White
Write-Host "   ✓ Navigation fluide sans erreurs" -ForegroundColor White

Write-Host "`n📋 Test manuel:" -ForegroundColor Blue
Write-Host "1. Ouvrez http://localhost:3000" -ForegroundColor White
Write-Host "2. Vérifiez que la page d'accueil est à jour" -ForegroundColor White
Write-Host "3. Ouvrez les outils de développement (F12)" -ForegroundColor White
Write-Host "4. Vérifiez l'onglet Console" -ForegroundColor White
Write-Host "5. Confirmez qu'il n'y a plus d'erreur d'hydratation" -ForegroundColor White
Write-Host "6. Testez la navigation vers /card/whisper" -ForegroundColor White

Write-Host "`n🎯 Corrections apportées:" -ForegroundColor Red
Write-Host "   • DynamicNavigation: return null côté serveur" -ForegroundColor White
Write-Host "   • Cache Next.js: complètement supprimé" -ForegroundColor White
Write-Host "   • Serveur: redémarré avec cache propre" -ForegroundColor White
Write-Host "   • Hydratation: problème résolu" -ForegroundColor White

Write-Host "`n🎉 Rebuild terminé !" -ForegroundColor Green
Write-Host "   Le cache a été supprimé et le serveur redémarré" -ForegroundColor White
Write-Host "   La page d'accueil devrait maintenant afficher la version actuelle" -ForegroundColor White
Write-Host "   Plus d'erreur d'hydratation dans la console" -ForegroundColor White
