# Script pour mettre à jour le prix du module QR Codes via l'API
Write-Host "💰 Mise à jour du prix du module QR Codes à 0.10€" -ForegroundColor Green
Write-Host ""

# URL de l'API de mise à jour (si elle existe) ou utiliser une approche directe
$apiUrl = "https://iahome.fr/api/update-module-price"

# Données à envoyer
$body = @{
    moduleId = "qrcodes"
    price = 0.10
} | ConvertTo-Json

Write-Host "🔍 Tentative de mise à jour via API..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri $apiUrl -Method POST -Body $body -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Prix mis à jour avec succès via API" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ API non disponible, mise à jour manuelle nécessaire" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ API non disponible, mise à jour manuelle nécessaire" -ForegroundColor Yellow
    Write-Host "   📝 Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Mise à jour manuelle nécessaire:" -ForegroundColor Cyan
Write-Host "1. Connectez-vous à la base de données PostgreSQL" -ForegroundColor White
Write-Host "2. Exécutez la requête SQL suivante:" -ForegroundColor White
Write-Host "   UPDATE modules SET price = 0.10 WHERE id = 'qrcodes';" -ForegroundColor Yellow
Write-Host "3. Vérifiez la mise à jour avec:" -ForegroundColor White
Write-Host "   SELECT id, title, price FROM modules WHERE id = 'qrcodes';" -ForegroundColor Yellow

Write-Host ""
Write-Host "✅ Script de mise à jour du prix terminé !" -ForegroundColor Green
Write-Host "💰 QR Codes: Nouveau prix 0.10€ (10 centimes)" -ForegroundColor Green
