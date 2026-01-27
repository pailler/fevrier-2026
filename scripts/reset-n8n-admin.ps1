# Script pour reinitialiser le compte admin de n8n
# Supprime tous les utilisateurs de la base de donnees pour permettre la recreation d'un compte admin

param(
    [string]$Email = "admin@regispailler.fr",
    [string]$Password = "Rasulova75",
    [string]$FirstName = "Admin",
    [string]$LastName = "User"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reinitialisation du compte admin n8n" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
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
    Write-Host "   Assurez-vous que n8n est demarre avec docker-compose" -ForegroundColor Yellow
    exit 1
}

# Verifier si le container n8n existe
$n8nContainer = docker ps -a --filter "name=^n8n$" --format "{{.Names}}"
if (-not $n8nContainer) {
    Write-Host "AVERTISSEMENT: Le container n8n n'existe pas" -ForegroundColor Yellow
    Write-Host "   Le script va quand meme supprimer les utilisateurs dans la base de donnees" -ForegroundColor Yellow
}

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "   Email: $Email" -ForegroundColor Gray
Write-Host "   Prenom: $FirstName" -ForegroundColor Gray
Write-Host "   Nom: $LastName" -ForegroundColor Gray
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous continuer ? Cela supprimera TOUS les utilisateurs existants (O/N)"
if ($confirmation -ne "O" -and $confirmation -ne "o" -and $confirmation -ne "Y" -and $confirmation -ne "y") {
    Write-Host "Operation annulee" -ForegroundColor Red
    exit 0
}

Write-Host ""
Write-Host "Suppression des utilisateurs existants dans la base de donnees..." -ForegroundColor Yellow

# Supprimer tous les utilisateurs de la table "user"
$deleteQuery = "DELETE FROM `"user`";"
$deleteResult = docker exec -i n8n-postgres psql -U n8n -d n8ndb -c $deleteQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "OK: Utilisateurs supprimes avec succes" -ForegroundColor Green
} else {
    Write-Host "ERREUR lors de la suppression des utilisateurs:" -ForegroundColor Red
    Write-Host $deleteResult -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Verification que la table est vide..." -ForegroundColor Yellow

# Verifier le nombre d'utilisateurs restants
$countQuery = "SELECT COUNT(*) FROM `"user`";"
$countResult = docker exec -i n8n-postgres psql -U n8n -d n8ndb -t -c $countQuery 2>&1
$userCount = ($countResult -replace '\s', '')

if ($userCount -eq "0") {
    Write-Host "OK: Aucun utilisateur restant dans la base de donnees" -ForegroundColor Green
} else {
    Write-Host "AVERTISSEMENT: Il reste $userCount utilisateur(s) dans la base de donnees" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Reinitialisation terminee !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   1. Accedez a https://n8n.regispailler.fr" -ForegroundColor White
Write-Host "   2. Creez un nouveau compte admin (le premier compte cree devient admin)" -ForegroundColor White
Write-Host "   3. Utilisez les identifiants suivants:" -ForegroundColor White
Write-Host "      Email: $Email" -ForegroundColor Cyan
Write-Host "      Mot de passe: (celui que vous choisirez lors de la creation)" -ForegroundColor Cyan
Write-Host ""
Write-Host "Alternative: Creer un utilisateur admin via la ligne de commande" -ForegroundColor Yellow
Write-Host "   docker exec -it n8n n8n user:create --email=$Email --firstName=$FirstName --lastName=$LastName --password=$Password" -ForegroundColor Gray
Write-Host ""

# Proposer de creer l'utilisateur via la ligne de commande
$createUser = Read-Host "Voulez-vous creer l'utilisateur admin maintenant via la ligne de commande ? (O/N)"
if ($createUser -eq "O" -or $createUser -eq "o" -or $createUser -eq "Y" -or $createUser -eq "y") {
    Write-Host ""
    Write-Host "Creation de l'utilisateur admin..." -ForegroundColor Yellow
    
    # Verifier si n8n est demarre
    $n8nRunning = docker ps --filter "name=^n8n$" --format "{{.Names}}"
    if (-not $n8nRunning) {
        Write-Host "AVERTISSEMENT: Le container n8n n'est pas demarre. Demarrage..." -ForegroundColor Yellow
        Write-Host "   Veuillez demarrer n8n manuellement avec: docker-compose up -d n8n" -ForegroundColor Yellow
        Write-Host "   Puis relancez cette commande:" -ForegroundColor Yellow
        Write-Host "   docker exec -it n8n n8n user:create --email=$Email --firstName=$FirstName --lastName=$LastName --password=$Password" -ForegroundColor Gray
        exit 0
    }
    
    # Creer l'utilisateur via n8n CLI
    $createCommand = "n8n user:create --email=$Email --firstName=$FirstName --lastName=$LastName --password=$Password"
    $createResult = docker exec -it n8n $createCommand 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "OK: Utilisateur admin cree avec succes !" -ForegroundColor Green
        Write-Host ""
        Write-Host "Identifiants de connexion:" -ForegroundColor Cyan
        Write-Host "   Email: $Email" -ForegroundColor White
        Write-Host "   Mot de passe: $Password" -ForegroundColor White
        Write-Host ""
        Write-Host "Acces: https://n8n.regispailler.fr" -ForegroundColor Cyan
    } else {
        Write-Host "ERREUR lors de la creation de l'utilisateur:" -ForegroundColor Red
        Write-Host $createResult -ForegroundColor Red
        Write-Host ""
        Write-Host "Vous pouvez creer le compte manuellement en accedant a https://n8n.regispailler.fr" -ForegroundColor Yellow
    }
}

Write-Host ""
