# Script pour reinitialiser automatiquement le compte admin de n8n
# Supprime tous les utilisateurs et cree un nouveau compte admin

param(
    [string]$Email = "admin@regispailler.fr",
    [string]$Password = "Rasulova75",
    [string]$FirstName = "Admin",
    [string]$LastName = "User"
)

Write-Host "Reinitialisation automatique du compte admin n8n..." -ForegroundColor Cyan
Write-Host ""

# Verifier si Docker est en cours d'execution
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Docker n'est pas en cours d'execution" -ForegroundColor Red
    exit 1
}

# Verifier si le container n8n-postgres existe
$postgresContainer = docker ps -a --filter "name=n8n-postgres" --format "{{.Names}}"
if (-not $postgresContainer) {
    Write-Host "ERREUR: Le container n8n-postgres n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Etape 1: Suppression des utilisateurs existants..." -ForegroundColor Yellow
$deleteQuery = "DELETE FROM `"user`";"
$deleteResult = docker exec -i n8n-postgres psql -U n8n -d n8ndb -c $deleteQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Utilisateurs supprimes" -ForegroundColor Green
} else {
    Write-Host "ERREUR lors de la suppression:" -ForegroundColor Red
    Write-Host $deleteResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Etape 2: Creation de l'utilisateur admin..." -ForegroundColor Yellow

# Verifier si n8n est demarre
$n8nRunning = docker ps --filter "name=^n8n$" --format "{{.Names}}"
if (-not $n8nRunning) {
    Write-Host "AVERTISSEMENT: Le container n8n n'est pas demarre" -ForegroundColor Yellow
    Write-Host "   Demarrez n8n avec: docker-compose up -d n8n" -ForegroundColor Yellow
    Write-Host "   Puis executez:" -ForegroundColor Yellow
    Write-Host "   docker exec -it n8n n8n user:create --email=$Email --firstName=$FirstName --lastName=$LastName --password=$Password" -ForegroundColor Gray
    exit 0
}

# Creer l'utilisateur via n8n CLI
$createCommand = "n8n user:create --email=$Email --firstName=$FirstName --lastName=$LastName --password=$Password"
$createResult = docker exec n8n $createCommand 2>&1

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
    Write-Host "Vous pouvez creer le compte manuellement en accedant a https://n8n.regispailler.fr" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
