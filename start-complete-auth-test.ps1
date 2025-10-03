#!/usr/bin/env pwsh

Write-Host "🚀 Test complet du système d'authentification..." -ForegroundColor Green

Write-Host "`n📋 Étapes de correction :" -ForegroundColor Yellow
Write-Host "1. Mise à jour de la base de données" -ForegroundColor White
Write-Host "2. Démarrage de l'application" -ForegroundColor White
Write-Host "3. Test complet du système" -ForegroundColor White

Write-Host "`n🔧 1. Mise à jour de la base de données..." -ForegroundColor Cyan
Write-Host "   - Ouvrez le dashboard Supabase (https://supabase.com/dashboard)" -ForegroundColor White
Write-Host "   - Allez dans l'éditeur SQL de votre projet" -ForegroundColor White
Write-Host "   - Exécutez le script: fix-database-schema.sql" -ForegroundColor White
Write-Host "   - Vérifiez que toutes les colonnes sont créées" -ForegroundColor White

Write-Host "`n🚀 2. Démarrage de l'application..." -ForegroundColor Cyan
Write-Host "   Démarrage de l'application Next.js..." -ForegroundColor White

try {
    # Vérifier si l'application est déjà en cours d'exécution
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 2
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Application déjà en cours d'exécution" -ForegroundColor Green
        }
    } catch {
        # Démarrer l'application
        Write-Host "   🚀 Démarrage de l'application..." -ForegroundColor Yellow
        $process = Start-Process -FilePath "npm" -ArgumentList "run", "dev" -PassThru -WindowStyle Hidden
        Write-Host "   ✅ Application démarrée (PID: $($process.Id))" -ForegroundColor Green
        
        # Attendre que l'application soit prête
        Write-Host "   ⏳ Attente du démarrage de l'application..." -ForegroundColor Yellow
        Start-Sleep -Seconds 15
    }
    
    # Vérifier que l'application répond
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method GET -TimeoutSec 5
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ Application accessible" -ForegroundColor Green
            
            # Exécuter les tests
            Write-Host "`n🧪 3. Exécution des tests complets..." -ForegroundColor Cyan
            node test-auth-with-app.js
            
            Write-Host "`n📋 4. Test manuel des pages..." -ForegroundColor Cyan
            Write-Host "   - Page d'inscription: http://localhost:3000/signup" -ForegroundColor White
            Write-Host "   - Page de connexion: http://localhost:3000/login" -ForegroundColor White
            Write-Host "   - Mot de passe oublié: http://localhost:3000/forgot-password" -ForegroundColor White
            Write-Host "   - Réinitialisation: http://localhost:3000/reset-password" -ForegroundColor White
            
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


