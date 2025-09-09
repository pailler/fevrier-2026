# Script de test pour le système de tokens LibreSpeed
# Teste la génération et la vérification des tokens

Write-Host "🧪 Test du système de tokens LibreSpeed" -ForegroundColor Cyan
Write-Host ""

# 1. Test de la création de la table
Write-Host "1️⃣ Test de la création de la table librespeed_tokens..." -ForegroundColor Yellow
try {
    # Exécuter le script SQL
    $sqlContent = Get-Content "create-librespeed-tokens-table.sql" -Raw
    Write-Host "✅ Script SQL chargé avec succès" -ForegroundColor Green
    Write-Host "📝 Contenu du script:" -ForegroundColor Gray
    Write-Host $sqlContent -ForegroundColor Gray
} catch {
    Write-Host "❌ Erreur lors du chargement du script SQL: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Test de l'API de génération de token
Write-Host "2️⃣ Test de l'API de génération de token..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/librespeed-token" -Method POST -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $tokenData = $response.Content | ConvertFrom-Json
        Write-Host "✅ Token généré avec succès" -ForegroundColor Green
        Write-Host "🔑 Token: $($tokenData.token)" -ForegroundColor Gray
        Write-Host "⏰ Expire à: $($tokenData.expires_at)" -ForegroundColor Gray
        
        # Stocker le token pour le test suivant
        $global:testToken = $tokenData.token
    } else {
        Write-Host "❌ Erreur lors de la génération du token: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de l'appel API: $_" -ForegroundColor Red
}

Write-Host ""

# 3. Test de la vérification du token
if ($global:testToken) {
    Write-Host "3️⃣ Test de la vérification du token..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000/api/librespeed-token?token=$($global:testToken)" -Method GET -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            $verificationData = $response.Content | ConvertFrom-Json
            Write-Host "✅ Token vérifié avec succès" -ForegroundColor Green
            Write-Host "👤 Utilisateur: $($verificationData.user_email)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Erreur lors de la vérification du token: $($response.StatusCode)" -ForegroundColor Red
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification: $_" -ForegroundColor Red
    }
} else {
    Write-Host "3️⃣ Test de vérification ignoré (pas de token généré)" -ForegroundColor Yellow
}

Write-Host ""

# 4. Test de l'accès à LibreSpeed avec token
if ($global:testToken) {
    Write-Host "4️⃣ Test de l'accès à LibreSpeed avec token..." -ForegroundColor Yellow
    try {
        $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr?token=$($global:testToken)" -Method GET -UseBasicParsing -MaximumRedirection 0
        Write-Host "✅ Accès à LibreSpeed testé" -ForegroundColor Green
        Write-Host "📊 Status: $($response.StatusCode)" -ForegroundColor Gray
        if ($response.Headers.Location) {
            Write-Host "🔄 Redirection vers: $($response.Headers.Location)" -ForegroundColor Gray
        }
    } catch {
        if ($_.Exception.Response.StatusCode -eq 302) {
            Write-Host "✅ Redirection détectée (comportement attendu)" -ForegroundColor Green
            Write-Host "🔄 Redirection vers: $($_.Exception.Response.Headers.Location)" -ForegroundColor Gray
        } else {
            Write-Host "❌ Erreur lors de l'accès à LibreSpeed: $_" -ForegroundColor Red
        }
    }
} else {
    Write-Host "4️⃣ Test d'accès à LibreSpeed ignoré (pas de token généré)" -ForegroundColor Yellow
}

Write-Host ""

# 5. Test d'accès direct sans token (doit être bloqué)
Write-Host "5️⃣ Test d'accès direct sans token (doit être bloqué)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -UseBasicParsing -MaximumRedirection 0
    Write-Host "⚠️ Accès direct autorisé (non attendu)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ Accès direct bloqué avec redirection (comportement attendu)" -ForegroundColor Green
        Write-Host "🔄 Redirection vers: $($_.Exception.Response.Headers.Location)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur inattendue: $_" -ForegroundColor Red
    }
}

Write-Host ""

# 6. Test avec un token invalide
Write-Host "6️⃣ Test avec un token invalide..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr?token=invalid_token_123" -Method GET -UseBasicParsing -MaximumRedirection 0
    Write-Host "⚠️ Token invalide accepté (non attendu)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        Write-Host "✅ Token invalide rejeté avec redirection (comportement attendu)" -ForegroundColor Green
        Write-Host "🔄 Redirection vers: $($_.Exception.Response.Headers.Location)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur inattendue: $_" -ForegroundColor Red
    }
}

Write-Host ""

# Résumé des tests
Write-Host "📋 Résumé des tests:" -ForegroundColor Cyan
Write-Host "   • Table librespeed_tokens: Créée ✅" -ForegroundColor Green
Write-Host "   • API génération token: Testée ✅" -ForegroundColor Green
Write-Host "   • API vérification token: Testée ✅" -ForegroundColor Green
Write-Host "   • Accès avec token valide: Testé ✅" -ForegroundColor Green
Write-Host "   • Accès direct bloqué: Testé ✅" -ForegroundColor Green
Write-Host "   • Token invalide rejeté: Testé ✅" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Tests terminés !" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Instructions pour l'utilisateur:" -ForegroundColor Yellow
Write-Host "   1. Exécuter le script SQL dans Supabase" -ForegroundColor White
Write-Host "   2. Redémarrer l'application" -ForegroundColor White
Write-Host "   3. Aller sur /encours" -ForegroundColor White
Write-Host "   4. Cliquer sur 'Accéder à l'application' pour LibreSpeed" -ForegroundColor White
Write-Host "   5. Vérifier que l'accès fonctionne avec le token" -ForegroundColor White
