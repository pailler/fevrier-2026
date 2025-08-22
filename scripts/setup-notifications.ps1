# Script pour configurer les tables de notifications
Write-Host "Configuration des tables de notifications..." -ForegroundColor Blue

# Chemin vers le fichier SQL
$sqlFile = "scripts/create-notifications-table.sql"

# Vérifier si le fichier existe
if (-not (Test-Path $sqlFile)) {
    Write-Host "Fichier SQL non trouve: $sqlFile" -ForegroundColor Red
    exit 1
}

Write-Host "Lecture du fichier SQL..." -ForegroundColor Yellow
$sqlContent = Get-Content $sqlFile -Raw

Write-Host "Contenu du fichier SQL:" -ForegroundColor Cyan
Write-Host $sqlContent -ForegroundColor Gray

Write-Host "Script de configuration des notifications cree avec succes!" -ForegroundColor Green
Write-Host "Pour executer ce script, vous devez:" -ForegroundColor Yellow
Write-Host "   1. Vous connecter a votre base de donnees Supabase" -ForegroundColor White
Write-Host "   2. Executer le contenu du fichier: $sqlFile" -ForegroundColor White
Write-Host "   3. Ou utiliser l'interface SQL de Supabase" -ForegroundColor White

Write-Host "Une fois les tables creees, l'onglet notifications sera disponible dans l'admin!" -ForegroundColor Green
