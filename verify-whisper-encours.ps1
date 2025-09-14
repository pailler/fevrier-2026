# Script de vérification du module Whisper sur /encours
Write-Host "🔍 Vérification du module Whisper sur /encours..." -ForegroundColor Blue

Write-Host "`n📋 Instructions:" -ForegroundColor Yellow
Write-Host "1. Testez d'abord le workflow complet sur /card/whisper" -ForegroundColor White
Write-Host "2. Puis vérifiez que le module apparaît sur /encours" -ForegroundColor White

Write-Host "`n🌐 Test d'accès aux pages:" -ForegroundColor Cyan
try {
    $whisperResponse = Invoke-WebRequest -Uri "http://localhost:3000/card/whisper" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ Page Whisper: HTTP $($whisperResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur page Whisper: $($_.Exception.Message)" -ForegroundColor Red
}

try {
    $encoursResponse = Invoke-WebRequest -Uri "http://localhost:3000/encours" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ Page encours: HTTP $($encoursResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur page encours: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Workflow complet à tester:" -ForegroundColor Green
Write-Host "Étape 1: Ouvrir http://localhost:3000/card/whisper" -ForegroundColor White
Write-Host "Étape 2: Cliquer sur 'Choisir'" -ForegroundColor White
Write-Host "Étape 3: Cliquer sur 'Activer Whisper IA'" -ForegroundColor White
Write-Host "Étape 4: Attendre la page de transition" -ForegroundColor White
Write-Host "Étape 5: Attendre la redirection vers /encours" -ForegroundColor White
Write-Host "Étape 6: Vérifier que 'Whisper IA' est dans la liste" -ForegroundColor White

Write-Host "`n🔧 Dépannage possible:" -ForegroundColor Red
Write-Host "Si le module n'apparaît pas sur /encours:" -ForegroundColor White
Write-Host "1. Vérifiez la console du navigateur pour les erreurs" -ForegroundColor White
Write-Host "2. Vérifiez que l'utilisateur est connecté" -ForegroundColor White
Write-Host "3. Vérifiez la table user_applications dans Supabase" -ForegroundColor White
Write-Host "4. Vérifiez que l'API /api/activate-module fonctionne" -ForegroundColor White

Write-Host "`n📊 Structure attendue dans user_applications:" -ForegroundColor Magenta
Write-Host "   user_id: ID de l'utilisateur" -ForegroundColor White
Write-Host "   module_id: 'whisper'" -ForegroundColor White
Write-Host "   module_title: 'Whisper IA'" -ForegroundColor White
Write-Host "   access_level: 'basic'" -ForegroundColor White
Write-Host "   is_active: true" -ForegroundColor White
Write-Host "   expires_at: Date future" -ForegroundColor White

Write-Host "`n🎉 Testez le workflow et vérifiez /encours !" -ForegroundColor Green
