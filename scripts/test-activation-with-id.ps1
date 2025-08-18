# Script pour tester l'activation avec un ID utilisateur générique
Write-Host "Test de l'activation avec un ID utilisateur générique..." -ForegroundColor Green

# Test de l'API d'activation avec un ID utilisateur
Write-Host "`n1. Test de l'API d'activation..." -ForegroundColor Yellow

$testData = @{
    moduleId = "ruinedfooocus"
    userId = "00000000-0000-0000-0000-000000000000"
    moduleTitle = "RuinedFooocus - Génération d'images IA"
    moduleDescription = "Module de génération d'images avec Stable Diffusion"
    moduleCategory = "IA"
    moduleUrl = "https://ruinedfooocus.iahome.fr"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "https://iahome.fr/api/activate-module" -Method POST -Body $testData -ContentType "application/json"
    Write-Host "✅ Module activé avec succès" -ForegroundColor Green
    Write-Host "   Access ID: $($response.accessId)" -ForegroundColor Cyan
    Write-Host "   Token ID: $($response.tokenId)" -ForegroundColor Cyan
    Write-Host "   Expires At: $($response.expiresAt)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de l'activation: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`nTest d'activation termine !" -ForegroundColor Green






