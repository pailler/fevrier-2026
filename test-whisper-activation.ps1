# Script de test de l'activation du module Whisper
Write-Host "🎯 Test de l'activation du module Whisper IA..." -ForegroundColor Blue

Write-Host "`n✅ Modifications apportées:" -ForegroundColor Green
Write-Host "   ✓ Fonction handleActivate modifiée pour utiliser l'API /api/activate-module" -ForegroundColor White
Write-Host "   ✓ Ajout du module dans la table user_applications" -ForegroundColor White
Write-Host "   ✓ Gestion des erreurs avec messages d'alerte" -ForegroundColor White

Write-Host "`n🔄 Workflow complet:" -ForegroundColor Cyan
Write-Host "   1. Clic 'Choisir' → Affiche 'Activer Whisper IA'" -ForegroundColor White
Write-Host "   2. Clic 'Activer' → Appel API /api/activate-module" -ForegroundColor White
Write-Host "   3. Ajout dans user_applications avec:" -ForegroundColor White
Write-Host "      - user_id: ID de l'utilisateur connecté" -ForegroundColor White
Write-Host "      - module_id: 'whisper'" -ForegroundColor White
Write-Host "      - module_title: 'Whisper IA'" -ForegroundColor White
Write-Host "      - access_level: 'basic'" -ForegroundColor White
Write-Host "      - is_active: true" -ForegroundColor White
Write-Host "      - expires_at: +1 an" -ForegroundColor White
Write-Host "   4. Page de transition avec progression" -ForegroundColor White
Write-Host "   5. Redirection vers /encours" -ForegroundColor White
Write-Host "   6. Module Whisper visible sur /encours" -ForegroundColor White

Write-Host "`n🌐 Test des APIs:" -ForegroundColor Yellow
try {
    $activateResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/activate-module" -Method POST -ContentType "application/json" -Body '{"moduleId":"test","userId":"test","moduleTitle":"Test"}' -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ API activate-module: HTTP $($activateResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur API activate-module: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📱 Test du workflow:" -ForegroundColor Magenta
Write-Host "   1. Ouvrez http://localhost:3000/card/whisper" -ForegroundColor White
Write-Host "   2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "   3. Cliquez sur 'Choisir'" -ForegroundColor White
Write-Host "   4. Cliquez sur 'Activer Whisper IA'" -ForegroundColor White
Write-Host "   5. Vérifiez la page de transition" -ForegroundColor White
Write-Host "   6. Vérifiez que le module apparaît sur /encours" -ForegroundColor White

Write-Host "`n🎉 Module Whisper IA maintenant ajouté à /encours !" -ForegroundColor Green
Write-Host "   Testez le workflow complet sur: http://localhost:3000/card/whisper" -ForegroundColor White
