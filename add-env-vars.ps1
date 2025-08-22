# Script pour ajouter les variables d'environnement de notifications
Write-Host "Ajout des variables d'environnement..." -ForegroundColor Blue

$envContent = @"

# Email Configuration for Notifications
EMAIL_PROVIDER=resend
RESEND_API_KEY=re_eJ8fb3yV_DXuMCknN7ExXnxXHmf825NJf
RESEND_FROM_EMAIL=noreply@iahome.fr
NEXT_PUBLIC_APP_URL=https://iahome.fr
"@

# Ajouter au fichier .env.local
Add-Content -Path ".env.local" -Value $envContent

Write-Host "Variables d'environnement ajoutees a .env.local" -ForegroundColor Green
Write-Host "Redemarrez l'application pour appliquer les changements" -ForegroundColor Yellow
