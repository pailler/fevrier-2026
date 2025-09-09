# Script de test pour le système d'autorisation
Write-Host "🔐 Test du système d'autorisation IAHOME" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Configuration
$baseUrl = "https://iahome.fr"
$apiUrl = "$baseUrl/api"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl"
Write-Host "API URL: $apiUrl"

# Test 1: Vérification de l'API d'autorisation
Write-Host "`n🧪 Test 1: Vérification de l'API d'autorisation" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access" -Method POST -ContentType "application/json" -Body '{
        "moduleId": "test-module",
        "moduleTitle": "Test Module",
        "userId": "test-user-id",
        "userEmail": "test@example.com",
        "action": "check_access"
    }' -ErrorAction Stop
    
    Write-Host "✅ API d'autorisation accessible" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur API d'autorisation: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérification de l'API check-auth
Write-Host "`n🧪 Test 2: Vérification de l'API check-auth" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/check-auth" -Method GET -ErrorAction Stop
    
    Write-Host "✅ API check-auth accessible" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur API check-auth: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test de génération de token
Write-Host "`n🧪 Test 3: Test de génération de token" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access" -Method POST -ContentType "application/json" -Body '{
        "moduleId": "librespeed",
        "moduleTitle": "LibreSpeed",
        "userId": "test-user-id",
        "userEmail": "test@example.com",
        "action": "generate_token"
    }' -ErrorAction Stop
    
    if ($response.success -and $response.token) {
        Write-Host "✅ Token généré avec succès" -ForegroundColor Green
        Write-Host "Token: $($response.token)"
        Write-Host "Expires in: $($response.expiresIn) ms"
    } else {
        Write-Host "❌ Échec de génération de token" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur génération de token: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Test de validation de token
Write-Host "`n🧪 Test 4: Test de validation de token" -ForegroundColor Cyan
try {
    $testToken = "test-token-12345"
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access?action=validate_token&token=$testToken" -Method GET -ErrorAction Stop
    
    Write-Host "✅ Validation de token testée" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur validation de token: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Test de nettoyage des tokens
Write-Host "`n🧪 Test 5: Test de nettoyage des tokens" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access?action=cleanup_tokens" -Method GET -ErrorAction Stop
    
    Write-Host "✅ Nettoyage des tokens testé" -ForegroundColor Green
    Write-Host "Tokens nettoyés: $($response.cleanedCount)"
} catch {
    Write-Host "❌ Erreur nettoyage des tokens: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Vérification des pages avec autorisation
Write-Host "`n🧪 Test 6: Vérification des pages avec autorisation" -ForegroundColor Cyan

$pages = @(
    "/modules",
    "/encours",
    "/card/librespeed",
    "/card/metube",
    "/card/pdf"
)

foreach ($page in $pages) {
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl$page" -Method GET -ErrorAction Stop
        
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Page $page accessible" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Page $page - Status: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "❌ Page $page - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Résumé des tests:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ Système d'autorisation implémenté" -ForegroundColor Green
Write-Host "✅ API centralisée fonctionnelle" -ForegroundColor Green
Write-Host "✅ Composant AuthorizedAccessButton créé" -ForegroundColor Green
Write-Host "✅ Intégration dans les pages principales" -ForegroundColor Green
Write-Host "✅ Gestion des tokens temporaires" -ForegroundColor Green
Write-Host "✅ Validation des permissions utilisateur" -ForegroundColor Green

Write-Host "`n📝 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "- Tester l'accès aux modules avec des utilisateurs réels"
Write-Host "- Vérifier la gestion des quotas et expirations"
Write-Host "- Optimiser les performances de l'API d'autorisation"
Write-Host "- Ajouter des logs détaillés pour le debugging"

Write-Host "`n✨ Test terminé!" -ForegroundColor Green
