#!/usr/bin/env pwsh

Write-Host "🚀 Test complet du système de création de compte..." -ForegroundColor Green

Write-Host "`n📋 Étapes à suivre :" -ForegroundColor Yellow
Write-Host "1. Mettre à jour la table profiles avec le script SQL" -ForegroundColor White
Write-Host "2. Démarrer l'application Next.js" -ForegroundColor White
Write-Host "3. Exécuter les tests" -ForegroundColor White

Write-Host "`n🔧 1. Mise à jour de la table profiles..." -ForegroundColor Cyan
Write-Host "   - Ouvrez le dashboard Supabase" -ForegroundColor White
Write-Host "   - Allez dans l'éditeur SQL" -ForegroundColor White
Write-Host "   - Exécutez le script: update-profiles-table.sql" -ForegroundColor White

Write-Host "`n🚀 2. Démarrage de l'application..." -ForegroundColor Cyan
Write-Host "   Exécution de: npm run dev" -ForegroundColor White

try {
    # Démarrer l'application en arrière-plan
    $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
    Write-Host "   ✅ Application démarrée (PID: $($process.Id))" -ForegroundColor Green
    
    # Attendre que l'application soit prête
    Write-Host "   ⏳ Attente du démarrage de l'application..." -ForegroundColor Yellow
    Start-Sleep -Seconds 10
    
    # Vérifier si l'application répond
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Application accessible" -ForegroundColor Green
            
            # Exécuter les tests
            Write-Host "`n🧪 3. Exécution des tests..." -ForegroundColor Cyan
            node test-complete-signup-system.js
            
            Write-Host "`n📋 4. Test manuel des pages..." -ForegroundColor Cyan
            Write-Host "   - Page d'inscription: http://localhost:3000/signup" -ForegroundColor White
            Write-Host "   - Page de connexion: http://localhost:3000/login" -ForegroundColor White
            Write-Host "   - Mot de passe oublié: http://localhost:3000/forgot-password" -ForegroundColor White
            
        } else {
            Write-Host "   ❌ Application non accessible" -ForegroundColor Red
        }
    } catch {
        Write-Host "   ❌ Application non accessible: $_" -ForegroundColor Red
        Write-Host "   📋 Vérifiez que l'application est bien démarrée" -ForegroundColor Yellow
    }
    
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $_" -ForegroundColor Red
    Write-Host "   📋 Démarrez manuellement avec: npm run dev" -ForegroundColor Yellow
}

Write-Host "`n🎉 Script terminé !" -ForegroundColor Green
Write-Host "📋 N'oubliez pas d'arrêter l'application avec Ctrl+C" -ForegroundColor Yellow



