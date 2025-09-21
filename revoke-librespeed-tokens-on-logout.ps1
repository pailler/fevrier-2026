# Script pour révoquer les tokens LibreSpeed lors de la déconnexion
Write-Host "🔐 Révocation des tokens LibreSpeed lors de la déconnexion..." -ForegroundColor Cyan

# Configuration
$LIBRESPEED_AUTH_URL = "http://localhost:7006"
$USER_ID = $args[0]

if (-not $USER_ID) {
    Write-Host "❌ Usage: .\revoke-librespeed-tokens-on-logout.ps1 <USER_ID>" -ForegroundColor Red
    Write-Host "💡 Exemple: .\revoke-librespeed-tokens-on-logout.ps1 user123" -ForegroundColor Yellow
    exit 1
}

Write-Host "👤 Révocation des tokens pour l'utilisateur: $USER_ID" -ForegroundColor Yellow

try {
    # Appeler l'API de révocation des tokens utilisateur
    $revokeBody = @{
        userId = $USER_ID
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$LIBRESPEED_AUTH_URL/api/revoke-user-tokens" -Method POST -Body $revokeBody -ContentType "application/json" -TimeoutSec 10

    if ($response.success) {
        Write-Host "✅ Tous les tokens LibreSpeed de l'utilisateur ont été révoqués!" -ForegroundColor Green
        Write-Host "📊 Réponse: $($response.message)" -ForegroundColor Cyan
        Write-Host "⏰ Timestamp: $($response.timestamp)" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur lors de la révocation: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la révocation des tokens: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Révocation terminée!" -ForegroundColor Green
Write-Host "💡 L'utilisateur $USER_ID ne peut plus accéder à LibreSpeed avec ses anciens tokens" -ForegroundColor Cyan
