# Script pour créer un token de session LibreSpeed lors de la connexion
Write-Host "🔑 Création d'un token de session LibreSpeed..." -ForegroundColor Cyan

# Configuration
$LIBRESPEED_AUTH_URL = "http://localhost:7006"
$USER_ID = $args[0]
$USER_EMAIL = $args[1]
$DURATION_HOURS = $args[2]

if (-not $USER_ID -or -not $USER_EMAIL) {
    Write-Host "❌ Usage: .\create-librespeed-session-token.ps1 <USER_ID> <USER_EMAIL> [DURATION_HOURS]" -ForegroundColor Red
    Write-Host "💡 Exemple: .\create-librespeed-session-token.ps1 user123 user@example.com 24" -ForegroundColor Yellow
    exit 1
}

if (-not $DURATION_HOURS) {
    $DURATION_HOURS = 24
}

Write-Host "👤 Création d'un token pour l'utilisateur: $USER_EMAIL" -ForegroundColor Yellow
Write-Host "⏰ Durée: $DURATION_HOURS heures" -ForegroundColor Yellow

try {
    # Appeler l'API de création de token de session
    $createBody = @{
        userId = $USER_ID
        userEmail = $USER_EMAIL
        duration_hours = [int]$DURATION_HOURS
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$LIBRESPEED_AUTH_URL/api/create-session-token" -Method POST -Body $createBody -ContentType "application/json" -TimeoutSec 10

    if ($response.success) {
        Write-Host "✅ Token de session créé avec succès!" -ForegroundColor Green
        Write-Host "🔑 Token: $($response.token)" -ForegroundColor Cyan
        Write-Host "👤 Utilisateur: $($response.userEmail)" -ForegroundColor Cyan
        Write-Host "⏰ Expire dans: $($response.expires_in_hours) heures" -ForegroundColor Cyan
        Write-Host "⏰ Timestamp: $($response.timestamp)" -ForegroundColor Cyan
        
        # Générer l'URL d'accès à LibreSpeed
        $librespeedUrl = "https://librespeed.iahome.fr/?token=$($response.token)"
        Write-Host "`n🌐 URL d'accès à LibreSpeed:" -ForegroundColor Yellow
        Write-Host $librespeedUrl -ForegroundColor White
        
        # Sauvegarder le token dans un fichier pour référence
        $tokenInfo = @{
            token = $response.token
            userId = $response.userId
            userEmail = $response.userEmail
            expires_in_hours = $response.expires_in_hours
            created_at = $response.timestamp
            librespeed_url = $librespeedUrl
        } | ConvertTo-Json -Depth 3
        
        $tokenFile = "librespeed-token-$USER_ID.json"
        $tokenInfo | Out-File -FilePath $tokenFile -Encoding UTF8
        Write-Host "💾 Token sauvegardé dans: $tokenFile" -ForegroundColor Cyan
    } else {
        Write-Host "❌ Erreur lors de la création du token: $($response.error)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur lors de la création du token: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎉 Token de session créé!" -ForegroundColor Green
Write-Host "💡 L'utilisateur peut maintenant accéder à LibreSpeed avec ce token" -ForegroundColor Cyan
Write-Host "⚠️ Le token sera automatiquement révoqué lors de la déconnexion" -ForegroundColor Yellow
