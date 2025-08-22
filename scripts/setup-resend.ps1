Write-Host "Configuration Resend etape par etape..." -ForegroundColor Blue
Write-Host ""

Write-Host "Etapes pour configurer Resend :" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. Creez un compte sur https://resend.com" -ForegroundColor White
Write-Host "2. Verifiez votre email" -ForegroundColor White
Write-Host "3. Allez dans 'API Keys' et creez une nouvelle cle" -ForegroundColor White
Write-Host "4. Copiez la cle API (commence par 're_')" -ForegroundColor White
Write-Host "5. Allez dans 'Domains' et ajoutez votre domaine" -ForegroundColor White
Write-Host "6. Configurez les enregistrements DNS" -ForegroundColor White
Write-Host ""

Write-Host "Configuration actuelle :" -ForegroundColor Yellow
$envPath = ".env.local"
if (Test-Path $envPath) {
    $content = Get-Content $envPath
    $currentApiKey = ($content | Where-Object { $_ -match "RESEND_API_KEY" } | ForEach-Object { ($_ -split "=")[1] }).Trim()
    $currentFromEmail = ($content | Where-Object { $_ -match "RESEND_FROM_EMAIL" } | ForEach-Object { ($_ -split "=")[1] }).Trim()
    
    Write-Host "  API Key actuelle: $($currentApiKey.Substring(0, 10))..." -ForegroundColor White
    Write-Host "  Email expediteur: $currentFromEmail" -ForegroundColor White
    Write-Host ""
    
    if ($currentApiKey -eq "re_eJ8fb3yV_DXuMCknN7ExXnxXHmf825NJf") {
        Write-Host "ATTENTION: Cette cle API semble etre un exemple ou invalide!" -ForegroundColor Red
        Write-Host "Vous devez obtenir une vraie cle API depuis votre compte Resend." -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Actions a effectuer :" -ForegroundColor Green
Write-Host "1. Ouvrez https://resend.com dans votre navigateur" -ForegroundColor White
Write-Host "2. Creez votre compte et obtenez une vraie cle API" -ForegroundColor White
Write-Host "3. Executez ce script pour mettre a jour la configuration" -ForegroundColor White
Write-Host ""

$newApiKey = Read-Host "Entrez votre nouvelle cle API Resend (ou appuyez sur Entree pour ignorer)"
if ($newApiKey) {
    Write-Host ""
    Write-Host "Mise a jour de la configuration..." -ForegroundColor Blue
    
    # Sauvegarder l'ancienne configuration
    Copy-Item .env.local .env.local.backup
    Write-Host "Sauvegarde creee: .env.local.backup" -ForegroundColor Green
    
    # Mettre a jour la cle API
    $content = Get-Content .env.local
    $updatedContent = $content -replace "RESEND_API_KEY=.*", "RESEND_API_KEY=$newApiKey"
    $updatedContent | Out-File .env.local -Encoding UTF8
    
    Write-Host "Cle API mise a jour!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Redemarrez l'application pour appliquer les changements" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "Configuration non modifiee." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Documentation Resend: https://resend.com/docs" -ForegroundColor Cyan
Write-Host "Guide de configuration: https://resend.com/docs/introduction" -ForegroundColor Cyan
