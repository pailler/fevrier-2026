# Script pour vérifier et nettoyer les modules en doublon
Write-Host "🔍 Vérification des modules en doublon..." -ForegroundColor Blue

# Test de l'API de vérification des modules
Write-Host "`n1️⃣ Test de l'API de vérification des modules..." -ForegroundColor Yellow

try {
    $response = Invoke-RestMethod -Uri "https://localhost:443/api/check-module-activation" -Method POST -Body (@{
        userEmail = "test@example.com"
        moduleId = "librespeed"
    } | ConvertTo-Json) -ContentType "application/json" -SkipCertificateCheck
    
    Write-Host "✅ API de vérification accessible" -ForegroundColor Green
    Write-Host "   Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur API de vérification: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API de santé
Write-Host "`n2️⃣ Test de l'API de santé..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-RestMethod -Uri "https://localhost:443/api/health" -Method GET -SkipCertificateCheck
    Write-Host "✅ API de santé accessible" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.status)"
    Write-Host "   Environment: $($healthResponse.environment)"
} catch {
    Write-Host "❌ Erreur API de santé: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n📋 Instructions pour résoudre le problème de doublon:" -ForegroundColor Cyan
Write-Host "1. Vérifier la base de données Supabase pour les doublons" -ForegroundColor White
Write-Host "2. Supprimer les entrées en doublon dans user_applications" -ForegroundColor White
Write-Host "3. Ajouter une protection contre les clics multiples" -ForegroundColor White
Write-Host "4. Désactiver le bouton pendant le traitement" -ForegroundColor White

Write-Host "`n🎯 Test terminé !" -ForegroundColor Green

