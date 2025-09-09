# Script pour configurer les applications utilisateur
Write-Host "🔧 Configuration des applications utilisateur" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

$baseUrl = "https://iahome.fr"
$apiUrl = "$baseUrl/api"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl"
Write-Host "API URL: $apiUrl"

# Étape 1: Créer la table user_applications
Write-Host "`n🔧 Étape 1: Création de la table user_applications" -ForegroundColor Cyan
try {
    $sqlContent = Get-Content "create-user-applications-table.sql" -Raw
    $response = Invoke-RestMethod -Uri "$apiUrl/execute-sql" -Method POST -ContentType "application/json" -Body (@{
        sql = $sqlContent
    } | ConvertTo-Json) -ErrorAction Stop
    
    Write-Host "✅ Table user_applications créée" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur création table: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 2: Ajouter des données de test
Write-Host "`n🔧 Étape 2: Ajout des données de test" -ForegroundColor Cyan
try {
    $sqlContent = Get-Content "add-test-user-applications.sql" -Raw
    $response = Invoke-RestMethod -Uri "$apiUrl/execute-sql" -Method POST -ContentType "application/json" -Body (@{
        sql = $sqlContent
    } | ConvertTo-Json) -ErrorAction Stop
    
    Write-Host "✅ Données de test ajoutées" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur ajout données: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 3: Vérifier les données
Write-Host "`n🔧 Étape 3: Vérification des données" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/check-table" -Method GET -ErrorAction Stop
    
    Write-Host "✅ Vérification des tables" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur vérification: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 4: Tester l'API d'autorisation
Write-Host "`n🔧 Étape 4: Test de l'API d'autorisation" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/authorize-module-access" -Method POST -ContentType "application/json" -Body '{
        "moduleId": "librespeed",
        "moduleTitle": "LibreSpeed",
        "userId": "00000000-0000-0000-0000-000000000000",
        "userEmail": "test@example.com",
        "action": "check_access"
    }' -ErrorAction Stop
    
    Write-Host "✅ Test API d'autorisation" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur test API: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration terminée!" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "Les applications utilisateur sont maintenant configurées." -ForegroundColor Yellow
Write-Host "Vous pouvez maintenant tester l'accès aux modules." -ForegroundColor Yellow
