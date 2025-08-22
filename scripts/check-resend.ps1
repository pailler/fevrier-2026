Write-Host "Test de la configuration Resend..." -ForegroundColor Blue

$envPath = ".env.local"
if (Test-Path $envPath) {
    $content = Get-Content $envPath
    $emailProvider = ($content | Where-Object { $_ -match "EMAIL_PROVIDER" } | ForEach-Object { ($_ -split "=")[1] }).Trim()
    $resendApiKey = ($content | Where-Object { $_ -match "RESEND_API_KEY" } | ForEach-Object { ($_ -split "=")[1] }).Trim()
    $resendFromEmail = ($content | Where-Object { $_ -match "RESEND_FROM_EMAIL" } | ForEach-Object { ($_ -split "=")[1] }).Trim()
    
    Write-Host ""
    Write-Host "Configuration actuelle:" -ForegroundColor Yellow
    Write-Host "  EMAIL_PROVIDER: $emailProvider" -ForegroundColor White
    Write-Host "  RESEND_API_KEY: $($resendApiKey.Substring(0, 10))..." -ForegroundColor White
    Write-Host "  RESEND_FROM_EMAIL: $resendFromEmail" -ForegroundColor White
    
    if ($emailProvider -eq "resend" -and $resendApiKey -and $resendFromEmail) {
        Write-Host ""
        Write-Host "Configuration Resend valide!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prochaines etapes:" -ForegroundColor Blue
        Write-Host "  1. Allez sur http://localhost:3000/admin" -ForegroundColor White
        Write-Host "  2. Cliquez sur l'onglet 'Notifications'" -ForegroundColor White
        Write-Host "  3. Testez l'envoi d'un email de test" -ForegroundColor White
        Write-Host "  4. Verifiez votre boite mail" -ForegroundColor White
    } else {
        Write-Host ""
        Write-Host "Configuration Resend incomplete!" -ForegroundColor Red
    }
} else {
    Write-Host "Fichier .env.local non trouve" -ForegroundColor Red
}
