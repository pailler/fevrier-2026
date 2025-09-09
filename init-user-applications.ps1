# Script pour initialiser les applications utilisateur
Write-Host "🔧 Initialisation des applications utilisateur" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

$baseUrl = "https://iahome.fr"
$apiUrl = "$baseUrl/api"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "Base URL: $baseUrl"
Write-Host "API URL: $apiUrl"

# Étape 1: Appeler l'API d'initialisation
Write-Host "`n🔧 Étape 1: Initialisation des applications" -ForegroundColor Cyan
try {
    $response = Invoke-RestMethod -Uri "$apiUrl/init-user-applications" -Method POST -ContentType "application/json" -ErrorAction Stop
    
    Write-Host "✅ Applications initialisées" -ForegroundColor Green
    Write-Host "Réponse: $($response | ConvertTo-Json -Depth 2)"
} catch {
    Write-Host "❌ Erreur initialisation: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Détails: $responseBody" -ForegroundColor Red
    }
}

# Étape 2: Tester l'API d'autorisation
Write-Host "`n🔧 Étape 2: Test de l'API d'autorisation" -ForegroundColor Cyan
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

Write-Host "`n🎯 Initialisation terminée!" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "Vérifiez les réponses ci-dessus pour voir si les applications ont été créées." -ForegroundColor Yellow
