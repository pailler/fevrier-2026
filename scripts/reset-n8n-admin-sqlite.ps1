# Script pour reinitialiser le compte admin de n8n (version SQLite)
# Supprime la base de donnees SQLite pour permettre la recreation d'un compte admin

param(
    [string]$Email = "admin@regispailler.fr",
    [string]$Password = "Rasulova75",
    [string]$FirstName = "Admin",
    [string]$LastName = "User"
)

Write-Host "Reinitialisation du compte admin n8n (SQLite)..." -ForegroundColor Cyan
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

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "   Email: $Email" -ForegroundColor Gray
Write-Host "   Prenom: $FirstName" -ForegroundColor Gray
Write-Host "   Nom: $LastName" -ForegroundColor Gray
Write-Host ""

# Arreter n8n pour pouvoir supprimer la base de donnees
Write-Host "Etape 1: Arret de n8n..." -ForegroundColor Yellow
docker stop n8n-iahome 2>&1 | Out-Null
Start-Sleep -Seconds 2

# Trouver le chemin du volume de donnees
$composeFile = "docker-services\essentiels\docker-compose.yml"
$dataPath = "docker-services\essentiels\n8n\data"

if (Test-Path $dataPath) {
    Write-Host "Etape 2: Sauvegarde et suppression de la base de donnees SQLite..." -ForegroundColor Yellow
    
    # Creer une sauvegarde
    $backupPath = "docker-services\essentiels\n8n\data-backup-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
    if (Test-Path "$dataPath\database.sqlite") {
        Copy-Item -Path "$dataPath\database.sqlite" -Destination "$backupPath\database.sqlite" -Force -ErrorAction SilentlyContinue
        Write-Host "   Sauvegarde creee: $backupPath\database.sqlite" -ForegroundColor Gray
    }
    
    # Supprimer la base de donnees
    if (Test-Path "$dataPath\database.sqlite") {
        Remove-Item -Path "$dataPath\database.sqlite" -Force
        Write-Host "OK: Base de donnees supprimee" -ForegroundColor Green
    } else {
        Write-Host "INFO: Aucune base de donnees trouvee (deja vide ou premiere installation)" -ForegroundColor Yellow
    }
} else {
    Write-Host "INFO: Le dossier de donnees n'existe pas encore" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Etape 3: Demarrage de n8n..." -ForegroundColor Yellow
docker start n8n-iahome 2>&1 | Out-Null

# Attendre que n8n soit pret
Write-Host "   Attente du demarrage de n8n..." -ForegroundColor Gray
$maxWait = 30
$waited = 0
$n8nReady = $false

while ($waited -lt $maxWait -and -not $n8nReady) {
    Start-Sleep -Seconds 2
    $waited += 2
    $healthCheck = docker exec n8n-iahome wget --no-verbose --tries=1 --spider http://localhost:5678/healthz 2>&1
    if ($LASTEXITCODE -eq 0) {
        $n8nReady = $true
    }
}

if (-not $n8nReady) {
    Write-Host "AVERTISSEMENT: n8n n'est pas encore pret, mais devrait l'etre bientot" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Etape 4: Creation de l'utilisateur admin..." -ForegroundColor Yellow

# Attendre encore un peu pour etre sur que n8n est completement demarre
Start-Sleep -Seconds 5

# Creer l'utilisateur via n8n CLI
$createCommand = "n8n user:create --email=$Email --firstName=$FirstName --lastName=$LastName --password=$Password"
$createResult = docker exec n8n-iahome $createCommand 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Utilisateur admin cree avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Identifiants de connexion:" -ForegroundColor Cyan
    Write-Host "   Email: $Email" -ForegroundColor White
    Write-Host "   Mot de passe: $Password" -ForegroundColor White
    Write-Host "   URL: https://n8n.regispailler.fr" -ForegroundColor White
    Write-Host "========================================" -ForegroundColor Cyan
} else {
    Write-Host "ERREUR lors de la creation de l'utilisateur:" -ForegroundColor Red
    Write-Host $createResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Vous pouvez creer le compte manuellement:" -ForegroundColor Yellow
    Write-Host "   1. Accedez a https://n8n.regispailler.fr" -ForegroundColor White
    Write-Host "   2. Le premier compte cree devient automatiquement admin" -ForegroundColor White
    exit 1
}

Write-Host ""
