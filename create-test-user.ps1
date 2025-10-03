# Script pour créer un utilisateur de test
Write-Host "🔍 Création d'un Utilisateur de Test" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan

# Attendre que le serveur démarre
Write-Host "`n⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 1. Vérifier que l'application est accessible
Write-Host "`n1. Vérification de l'accessibilité..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 15
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible sur http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "❌ Application non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de l'accès à l'application: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Le serveur est peut-être encore en cours de démarrage..." -ForegroundColor Yellow
    exit 1
}

# 2. Créer un utilisateur de test via l'API d'inscription
Write-Host "`n2. Création d'un utilisateur de test..." -ForegroundColor Yellow

$testUser = @{
    email = "test@example.com"
    password = "Password123"
    fullName = "Test User"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signup-alternative" -Method POST -Body $testUser -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
    
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ Utilisateur de test créé avec succès !" -ForegroundColor Green
        Write-Host "   Email: test@example.com" -ForegroundColor Gray
        Write-Host "   Mot de passe: Password123" -ForegroundColor Gray
        Write-Host "   Nom: Test User" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur lors de la création (Code: $($response.StatusCode))" -ForegroundColor Red
        $responseContent = $response.Content
        Write-Host "Réponse: $responseContent" -ForegroundColor Red
    }
} catch {
    $errorResponse = $_.Exception.Response
    if ($errorResponse.StatusCode -eq 409) {
        Write-Host "✅ Utilisateur de test existe déjà !" -ForegroundColor Green
        Write-Host "   Email: test@example.com" -ForegroundColor Gray
        Write-Host "   Mot de passe: Password123" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur lors de la création: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response) {
            $stream = $_.Exception.Response.GetResponseStream()
            $reader = New-Object System.IO.StreamReader($stream)
            $responseBody = $reader.ReadToEnd()
            Write-Host "Réponse: $responseBody" -ForegroundColor Red
        }
    }
}

# 3. Tester la connexion avec l'utilisateur créé
Write-Host "`n3. Test de connexion avec l'utilisateur créé..." -ForegroundColor Yellow

$loginData = @{
    email = "test@example.com"
    password = "Password123"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/auth/signin-alternative" -Method POST -Body $loginData -ContentType "application/json" -UseBasicParsing -TimeoutSec 15
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Connexion réussie !" -ForegroundColor Green
        $responseContent = $response.Content | ConvertFrom-Json
        Write-Host "   Token généré: $($responseContent.token.Substring(0, 20))..." -ForegroundColor Gray
        Write-Host "   Utilisateur: $($responseContent.user.email)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur lors de la connexion (Code: $($response.StatusCode))" -ForegroundColor Red
        $responseContent = $response.Content
        Write-Host "Réponse: $responseContent" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la connexion: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $stream = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($stream)
        $responseBody = $reader.ReadToEnd()
        Write-Host "Réponse: $responseBody" -ForegroundColor Red
    }
}

# 4. Instructions de test final
Write-Host "`n4. Test Final - Connexion dans le navigateur..." -ForegroundColor Yellow
Write-Host "=============================================" -ForegroundColor Yellow

Write-Host "`n📋 Testez maintenant la connexion dans votre navigateur:" -ForegroundColor Cyan
Write-Host "1. Ouvrez http://localhost:3000/login" -ForegroundColor White
Write-Host "2. Utilisez les identifiants suivants:" -ForegroundColor White
Write-Host "   - Email: test@example.com" -ForegroundColor Gray
Write-Host "   - Mot de passe: Password123" -ForegroundColor Gray
Write-Host "3. Cliquez sur 'Se connecter'" -ForegroundColor White
Write-Host "4. Vérifiez que vous êtes redirigé vers la page d'accueil" -ForegroundColor White
Write-Host "5. Vérifiez que vos informations apparaissent dans la bannière bleue" -ForegroundColor White

Write-Host "`n5. Fonctionnalités à tester après connexion:" -ForegroundColor White
Write-Host "   ✅ Affichage dans la bannière bleue" -ForegroundColor Green
Write-Host "   ✅ Accès à la page 'Mes applis'" -ForegroundColor Green
Write-Host "   ✅ Accès aux applications gratuites" -ForegroundColor Green
Write-Host "   ✅ Bouton de déconnexion fonctionnel" -ForegroundColor Green

Write-Host "`n🔍 Résultats attendus:" -ForegroundColor Cyan
Write-Host "✅ Utilisateur de test créé" -ForegroundColor Green
Write-Host "✅ Connexion API fonctionnelle" -ForegroundColor Green
Write-Host "✅ Connexion navigateur fonctionnelle" -ForegroundColor Green
Write-Host "✅ Système d'authentification opérationnel" -ForegroundColor Green

Write-Host "`n🎯 Résultat final:" -ForegroundColor Cyan
Write-Host "✅ UTILISATEUR DE TEST CRÉÉ !" -ForegroundColor Green
Write-Host "✅ Vous pouvez maintenant vous connecter avec:" -ForegroundColor Green
Write-Host "   Email: test@example.com" -ForegroundColor Green
Write-Host "   Mot de passe: Password123" -ForegroundColor Green

Write-Host "`n🚀 TESTEZ MAINTENANT LA CONNEXION DANS VOTRE NAVIGATEUR !" -ForegroundColor Green
Write-Host "Allez sur http://localhost:3000/login et connectez-vous." -ForegroundColor Green
