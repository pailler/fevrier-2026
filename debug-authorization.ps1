# Script de diagnostic pour le système d'autorisation
Write-Host "🔍 Diagnostic du système d'autorisation" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

$baseUrl = "https://iahome.fr"
$apiUrl = "$baseUrl/api"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl"
Write-Host "API URL: $apiUrl"

# Test 1: Vérifier l'API d'autorisation avec un utilisateur fictif
Write-Host "`n🧪 Test 1: Test de l'API d'autorisation" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access" -Method POST -ContentType "application/json" -Body '{
        "moduleId": "librespeed",
        "moduleTitle": "LibreSpeed",
        "userId": "00000000-0000-0000-0000-000000000000",
        "userEmail": "test@example.com",
        "action": "check_access"
    }' -ErrorAction Stop
    
    Write-Host "✅ API d'autorisation accessible" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur API d'autorisation: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Vérifier la structure de la base de données
Write-Host "`n🧪 Test 2: Vérification de la structure de la base" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/check-table" -Method GET -ErrorAction Stop
    
    Write-Host "✅ API de vérification de table accessible" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur vérification de table: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Vérifier les modules disponibles
Write-Host "`n🧪 Test 3: Vérification des modules" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/check-modules" -Method GET -ErrorAction Stop
    
    Write-Host "✅ API de vérification des modules accessible" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur vérification des modules: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: Vérifier l'interface utilisateur
Write-Host "`n🧪 Test 4: Vérification de l'interface utilisateur" -ForegroundColor Cyan

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

Write-Host "`n🎯 Diagnostic terminé!" -ForegroundColor Green
Write-Host "===================" -ForegroundColor Green
Write-Host "Vérifiez les réponses ci-dessus pour identifier les problèmes." -ForegroundColor Yellow
