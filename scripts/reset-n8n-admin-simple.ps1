# Script simple pour reinitialiser n8n en supprimant la base de donnees SQLite

Write-Host "Reinitialisation de n8n (suppression de la base de donnees)..." -ForegroundColor Cyan
Write-Host ""

# Verifier si Docker est en cours d'execution
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Docker n'est pas en cours d'execution" -ForegroundColor Red
    exit 1
}

# Verifier si le container n8n-iahome existe
$n8nContainer = docker ps -a --filter "name=n8n-iahome" --format "{{.Names}}"
if (-not $n8nContainer) {
    Write-Host "ERREUR: Le container n8n-iahome n'existe pas" -ForegroundColor Red
    exit 1
}

# Arreter n8n
Write-Host "Arret de n8n..." -ForegroundColor Yellow
docker stop n8n-iahome 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Chemin de la base de donnees
$dataPath = "docker-services\essentiels\n8n\data"
$dbFile = "$dataPath\database.sqlite"

if (Test-Path $dbFile) {
    # Creer le dossier de sauvegarde s'il n'existe pas
    $backupDir = "$dataPath-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    New-Item -ItemType Directory -Path $backupDir -Force | Out-Null
    
    # Sauvegarder
    Copy-Item -Path $dbFile -Destination "$backupDir\database.sqlite" -Force
    Write-Host "Sauvegarde creee: $backupDir\database.sqlite" -ForegroundColor Gray
    
    # Supprimer la base de donnees
    Remove-Item -Path $dbFile -Force
    Write-Host "OK: Base de donnees supprimee" -ForegroundColor Green
} else {
    Write-Host "INFO: Aucune base de donnees trouvee (deja vide)" -ForegroundColor Yellow
}

# Redemarrer n8n
Write-Host ""
Write-Host "Demarrage de n8n..." -ForegroundColor Yellow
docker start n8n-iahome 2>&1 | Out-Null

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reinitialisation terminee !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. Attendez 30-60 secondes que n8n demarre completement" -ForegroundColor White
Write-Host "   2. Accedez a https://n8n.regispailler.fr" -ForegroundColor White
Write-Host "   3. Creez un nouveau compte (le premier compte devient admin)" -ForegroundColor White
Write-Host ""
Write-Host "Identifiants suggeres:" -ForegroundColor Yellow
Write-Host "   Email: admin@regispailler.fr" -ForegroundColor Cyan
Write-Host "   Mot de passe: (choisissez un mot de passe fort)" -ForegroundColor Cyan
Write-Host ""
