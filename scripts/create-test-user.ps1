# Script pour créer un utilisateur de test dans la base de données
Write-Host "Création d'un utilisateur de test..." -ForegroundColor Green

# Test de l'API de création d'utilisateur
Write-Host "`n1. Test de l'API de création d'utilisateur..." -ForegroundColor Yellow

$testData = @{
    email = "test@iahome.fr"
    password = "test123456"
    name = "Utilisateur Test"
    role = "user"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/auth/signup" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Utilisateur créé avec succès" -ForegroundColor Green
    Write-Host "   Email: $($response.email)" -ForegroundColor Cyan
    Write-Host "   ID: $($response.id)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de la création: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   L'utilisateur existe peut-être déjà" -ForegroundColor Yellow
}

Write-Host "`nCréation d'utilisateur termine !" -ForegroundColor Green
Write-Host "Vous pouvez maintenant tester l'activation de module" -ForegroundColor Cyan






