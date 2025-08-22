# Script pour tester la configuration Resend
Write-Host "🧪 Test de la configuration Resend..." -ForegroundColor Blue

# Charger les variables d'environnement
$envPath = ".env.local"
if (Test-Path $envPath) {
    Get-Content $envPath | ForEach-Object {
        if ($_ -match '^([^=]+)=(.*)$') {
            $name = $matches[1]
            $value = $matches[2]
            [Environment]::SetEnvironmentVariable($name, $value, 'Process')
        }
    }
    Write-Host "✅ Variables d'environnement chargées" -ForegroundColor Green
} else {
    Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
    exit 1
}

# Vérifier la configuration
$emailProvider = [Environment]::GetEnvironmentVariable('EMAIL_PROVIDER')
$resendApiKey = [Environment]::GetEnvironmentVariable('RESEND_API_KEY')
$resendFromEmail = [Environment]::GetEnvironmentVariable('RESEND_FROM_EMAIL')

Write-Host ""
Write-Host "📋 Configuration actuelle:" -ForegroundColor Yellow
Write-Host "  EMAIL_PROVIDER: $emailProvider" -ForegroundColor White
Write-Host "  RESEND_API_KEY: $($resendApiKey.Substring(0, 10))..." -ForegroundColor White
Write-Host "  RESEND_FROM_EMAIL: $resendFromEmail" -ForegroundColor White

if ($emailProvider -eq "resend" -and $resendApiKey -and $resendFromEmail) {
    Write-Host ""
    Write-Host "✅ Configuration Resend valide !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🎯 Prochaines étapes:" -ForegroundColor Blue
    Write-Host "  1. Allez sur http://localhost:3000/admin" -ForegroundColor White
    Write-Host "  2. Cliquez sur l'onglet '🔔 Notifications'" -ForegroundColor White
    Write-Host "  3. Testez l'envoi d'un email de test" -ForegroundColor White
    Write-Host "  4. Vérifiez votre boîte mail" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "❌ Configuration Resend incomplète !" -ForegroundColor Red
    Write-Host "Vérifiez vos variables d'environnement dans .env.local" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🔗 Documentation Resend: https://resend.com/docs" -ForegroundColor Cyan
