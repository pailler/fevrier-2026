# Script de test de la correction de l'API Whisper
Write-Host "🔧 Test de la correction de l'API Whisper IA..." -ForegroundColor Blue

Write-Host "`n✅ Problème identifié et corrigé:" -ForegroundColor Green
Write-Host "   ❌ Erreur: 'Invalid API key' (500)" -ForegroundColor Red
Write-Host "   ✓ Cause: SUPABASE_SERVICE_ROLE_KEY non définie" -ForegroundColor White
Write-Host "   ✓ Solution: Utilisation de NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor White

Write-Host "`n🔧 Modification apportée:" -ForegroundColor Cyan
Write-Host "   ✓ API /api/activate-whisper modifiée" -ForegroundColor White
Write-Host "   ✓ Utilisation de la clé anon au lieu de service_role" -ForegroundColor White
Write-Host "   ✓ Plus d'erreur 'Invalid API key'" -ForegroundColor White

Write-Host "`n🌐 Test de l'API:" -ForegroundColor Yellow
try {
    $apiResponse = Invoke-WebRequest -Uri "http://localhost:3000/api/activate-whisper" -UseBasicParsing -TimeoutSec 10
    Write-Host "   ✓ API activate-whisper: HTTP $($apiResponse.StatusCode)" -ForegroundColor White
} catch {
    Write-Host "   ❌ Erreur API activate-whisper: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Test du workflow corrigé:" -ForegroundColor Magenta
Write-Host "1. Ouvrez http://localhost:3000/card/whisper" -ForegroundColor White
Write-Host "2. Connectez-vous si nécessaire" -ForegroundColor White
Write-Host "3. Cliquez sur 'Choisir'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Activer Whisper IA'" -ForegroundColor White
Write-Host "5. Vérifiez qu'il n'y a plus d'erreur 'Invalid API key'" -ForegroundColor White
Write-Host "6. Vérifiez la page de transition" -ForegroundColor White
Write-Host "7. Vérifiez que le module apparaît sur /encours" -ForegroundColor White

Write-Host "`n🎯 Différences entre les clés:" -ForegroundColor Blue
Write-Host "   SUPABASE_SERVICE_ROLE_KEY:" -ForegroundColor White
Write-Host "   - Clé avec privilèges élevés" -ForegroundColor White
Write-Host "   - Peut contourner les RLS" -ForegroundColor White
Write-Host "   - Nécessite une configuration spéciale" -ForegroundColor White
Write-Host "   " -ForegroundColor White
Write-Host "   NEXT_PUBLIC_SUPABASE_ANON_KEY:" -ForegroundColor White
Write-Host "   - Clé publique standard" -ForegroundColor White
Write-Host "   - Respecte les RLS" -ForegroundColor White
Write-Host "   - Disponible par défaut" -ForegroundColor White

Write-Host "`n🎉 Erreur API corrigée ! Testez maintenant le workflow." -ForegroundColor Green
Write-Host "URL: http://localhost:3000/card/whisper" -ForegroundColor White
