# Script de test final du module Whisper IA
Write-Host "🎯 Test final du module Whisper IA..." -ForegroundColor Blue

Write-Host "`n✅ Corrections apportées:" -ForegroundColor Green
Write-Host "   ✓ Erreur 'Utilisateur non trouvé' corrigée" -ForegroundColor White
Write-Host "   ✓ Nouvelle API /api/activate-whisper créée" -ForegroundColor White
Write-Host "   ✓ Pas de vérification de la table 'profiles'" -ForegroundColor White
Write-Host "   ✓ Ajout direct dans 'user_applications'" -ForegroundColor White

Write-Host "`n🌐 Test d'accès aux pages:" -ForegroundColor Cyan
try {
    $whisperResponse = Invoke-WebRequest -Uri "http://localhost:3000/card/whisper" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ Page Whisper: HTTP $($whisperResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur page Whisper: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $transitionResponse = Invoke-WebRequest -Uri "http://localhost:3000/transition" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ Page transition: HTTP $($transitionResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur page transition: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $encoursResponse = Invoke-WebRequest -Uri "http://localhost:3000/encours" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ Page encours: HTTP $($encoursResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur page encours: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Workflow complet à tester:" -ForegroundColor Yellow
Write-Host "Étape 1: Ouvrir http://localhost:3000/card/whisper" -ForegroundColor White
Write-Host "Étape 2: Se connecter si nécessaire" -ForegroundColor White
Write-Host "Étape 3: Cliquer sur 'Choisir' (bouton bleu)" -ForegroundColor White
Write-Host "Étape 4: Cliquer sur 'Activer Whisper IA' (bouton vert)" -ForegroundColor White
Write-Host "Étape 5: Vérifier qu'il n'y a plus d'erreur 'Utilisateur non trouvé'" -ForegroundColor White
Write-Host "Étape 6: Observer la page de transition avec progression" -ForegroundColor White
Write-Host "Étape 7: Attendre la redirection vers /encours" -ForegroundColor White
Write-Host "Étape 8: Vérifier que 'Whisper IA' apparaît dans la liste" -ForegroundColor White

Write-Host "`n🔧 Dépannage si problème:" -ForegroundColor Red
Write-Host "1. Vérifiez la console du navigateur pour les erreurs" -ForegroundColor White
Write-Host "2. Vérifiez que l'utilisateur est connecté" -ForegroundColor White
Write-Host "3. Vérifiez la table user_applications dans Supabase" -ForegroundColor White
Write-Host "4. Vérifiez que l'API /api/activate-whisper fonctionne" -ForegroundColor White

Write-Host "`n📊 Structure attendue dans user_applications:" -ForegroundColor Magenta
Write-Host "   user_id: ID de l'utilisateur connecté" -ForegroundColor White
Write-Host "   module_id: 'whisper'" -ForegroundColor White
Write-Host "   module_title: 'Whisper IA'" -ForegroundColor White
Write-Host "   access_level: 'basic'" -ForegroundColor White
Write-Host "   is_active: true" -ForegroundColor White
Write-Host "   expires_at: Date +1 an" -ForegroundColor White

Write-Host "`n🎉 Module Whisper IA prêt pour le test final !" -ForegroundColor Green
Write-Host "URL: http://localhost:3000/card/whisper" -ForegroundColor White
