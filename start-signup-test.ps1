#!/usr/bin/env pwsh

Write-Host "🚀 Démarrage du test du système d'inscription..." -ForegroundColor Green

# Vérifier si l'application est en cours d'exécution
Write-Host "📋 Vérification de l'état de l'application..." -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application en cours d'exécution" -ForegroundColor Green
        
        # Exécuter le test
        Write-Host "🧪 Exécution du test d'inscription..." -ForegroundColor Yellow
        node test-signup-system.js
        
        Write-Host "`n📋 Test terminé !" -ForegroundColor Green
        Write-Host "📋 Vous pouvez maintenant tester manuellement sur:" -ForegroundColor Cyan
        Write-Host "   - Page d'inscription: http://localhost:3000/signup" -ForegroundColor White
        Write-Host "   - Page de connexion: http://localhost:3000/login" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Application non accessible sur http://localhost:3000" -ForegroundColor Red
    Write-Host "📋 Veuillez démarrer l'application avec: npm run dev" -ForegroundColor Yellow
    Write-Host "📋 Puis relancez ce script" -ForegroundColor Yellow
}

Write-Host "`n🎉 Script terminé !" -ForegroundColor Green






