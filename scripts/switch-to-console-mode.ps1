# Script pour passer en mode console temporairement
Write-Host "Passage en mode console pour les emails..." -ForegroundColor Blue

$envFile = ".env.local"

# Lire le contenu actuel
$content = Get-Content $envFile -Raw

# Changer EMAIL_PROVIDER de resend à console
$content = $content -replace "EMAIL_PROVIDER=resend", "EMAIL_PROVIDER=console"

# Écrire le contenu modifié
$content | Set-Content $envFile

Write-Host "Mode console active!" -ForegroundColor Green
Write-Host ""
Write-Host "Configuration actuelle:" -ForegroundColor Yellow
Get-Content $envFile | Where-Object { $_ -match "EMAIL_PROVIDER" }

Write-Host ""
Write-Host "Avantages du mode console:" -ForegroundColor Cyan
Write-Host "- Pas besoin de clé API Resend" -ForegroundColor White
Write-Host "- Les emails s'affichent dans la console" -ForegroundColor White
Write-Host "- Permet de tester le systeme de notifications" -ForegroundColor White
Write-Host "- Redemarrez l'application pour appliquer les changements" -ForegroundColor White
