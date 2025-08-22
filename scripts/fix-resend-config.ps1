# Script pour corriger la configuration Resend
Write-Host "Correction de la configuration Resend..." -ForegroundColor Blue

$envFile = ".env.local"
$backupFile = ".env.local.backup"

# Créer une sauvegarde
if (Test-Path $envFile) {
    Copy-Item $envFile $backupFile
    Write-Host "Sauvegarde creee: $backupFile" -ForegroundColor Green
}

# Lire le contenu actuel
$content = Get-Content $envFile -Raw

# Supprimer la première entrée RESEND_API_KEY invalide
$content = $content -replace "RESEND_API_KEY=re_\.\.\.", ""

# Écrire le contenu corrigé
$content | Set-Content $envFile

Write-Host "Configuration Resend corrigee!" -ForegroundColor Green
Write-Host ""
Write-Host "Contenu du fichier .env.local:" -ForegroundColor Yellow
Get-Content $envFile | Where-Object { $_ -match "RESEND" -or $_ -match "EMAIL_PROVIDER" }
