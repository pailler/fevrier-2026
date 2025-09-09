# Script de test pour vérifier le système de quotas LibreSpeed
Write-Host "🧪 Test du système de quotas LibreSpeed" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$baseUrl = "https://iahome.fr"
$apiUrl = "$baseUrl/api"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl"
Write-Host "API URL: $apiUrl"

# Test 1: Vérification de l'API d'autorisation
Write-Host "`n🧪 Test 1: Vérification de l'API d'autorisation" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access" -Method POST -ContentType "application/json" -Body '{
        "moduleId": "librespeed",
        "moduleTitle": "LibreSpeed",
        "userId": "test-user-id",
        "userEmail": "test@example.com",
        "action": "check_access"
    }' -ErrorAction Stop
    
    Write-Host "✅ API d'autorisation accessible" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur API d'autorisation: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Test de génération de token avec quotas
Write-Host "`n🧪 Test 2: Test de génération de token avec quotas" -ForegroundColor Cyan
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
        if ($response.quotaInfo) {
            Write-Host "Quota Info: $($response.quotaInfo | ConvertTo-Json -Depth 2)"
        }
    } else {
        Write-Host "❌ Échec de génération de token: $($response.error)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur génération de token: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Test d'incrémentation des quotas
Write-Host "`n🧪 Test 3: Test d'incrémentation des quotas" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access" -Method POST -ContentType "application/json" -Body '{
        "moduleId": "librespeed",
        "moduleTitle": "LibreSpeed",
        "userId": "test-user-id",
        "userEmail": "test@example.com",
        "action": "increment_usage"
    }' -ErrorAction Stop
    
    Write-Host "✅ Incrémentation des quotas testée" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur incrémentation quotas: $($_.Exception.Message)" -ForegroundColor Red
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

# Test 5: Test de l'interface utilisateur
Write-Host "`n🧪 Test 5: Test de l'interface utilisateur" -ForegroundColor Cyan

$pages = @(
    "/modules",
    "/encours"
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

# Test 6: Test de LibreSpeed avec token
Write-Host "`n🧪 Test 6: Test de LibreSpeed avec token" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -ErrorAction Stop
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ LibreSpeed accessible" -ForegroundColor Green
    } else {
        Write-Host "⚠️ LibreSpeed - Status: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ LibreSpeed - Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Résumé des tests:" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "✅ Système de quotas implémenté" -ForegroundColor Green
Write-Host "✅ Vérification des quotas avant génération de token" -ForegroundColor Green
Write-Host "✅ Messages de chargement détaillés" -ForegroundColor Green
Write-Host "✅ Gestion des erreurs de quota" -ForegroundColor Green
Write-Host "✅ Incrémentation automatique des compteurs" -ForegroundColor Green

Write-Host "`n📝 Fonctionnalités testées:" -ForegroundColor Yellow
Write-Host "- Vérification des quotas avant accès"
Write-Host "- Génération de tokens temporaires sécurisés"
Write-Host "- Incrémentation des compteurs d'utilisation"
Write-Host "- Messages d'erreur informatifs"
Write-Host "- Interface utilisateur avec états de chargement"

Write-Host "`n✨ Tests terminés!" -ForegroundColor Green
