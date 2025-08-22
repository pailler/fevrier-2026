# Script pour revenir au mode Resend
Write-Host "Retour au mode Resend..." -ForegroundColor Blue

$envFile = ".env.local"

# Lire le contenu actuel
$content = Get-Content $envFile -Raw

# Changer EMAIL_PROVIDER de console à resend
$content = $content -replace "EMAIL_PROVIDER=console", "EMAIL_PROVIDER=resend"

# Écrire le contenu modifié
$content | Set-Content $envFile

Write-Host "Mode Resend active!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration actuelle:" -ForegroundColor Yellow
Get-Content $envFile | Where-Object { $_ -match "EMAIL_PROVIDER" -or $_ -match "RESEND" }

Write-Host ""
Write-Host "Avantages du mode Resend:" -ForegroundColor Cyan
Write-Host "- Envoi d'emails reel via Resend" -ForegroundColor White
Write-Host "- Integration avec Supabase" -ForegroundColor White
Write-Host "- Emails professionnels" -ForegroundColor White
Write-Host "- Redemarrez l'application pour appliquer les changements" -ForegroundColor White
