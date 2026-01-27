# Script pour mettre a jour l'URL de redirection OAuth dans les credentials n8n
# Remplace localhost:5678 par n8n.regispailler.fr dans les credentials OAuth2

Write-Host "Mise a jour des credentials OAuth2 n8n..." -ForegroundColor Cyan
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

Write-Host "Etape 1: Recherche des credentials contenant localhost:5678..." -ForegroundColor Yellow

# Rechercher les credentials qui contiennent localhost:5678
$searchQuery = @"
SELECT id, name, type, "data" 
FROM credentials_entity 
WHERE "data"::text LIKE '%localhost:5678%' 
   OR "data"::text LIKE '%http://localhost:5678%'
   OR "data"::text LIKE '%https://localhost:5678%';
"@

$searchResult = docker exec -i n8n-postgres psql -U n8n -d n8ndb -t -A -F "|" -c $searchQuery 2>&1

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR lors de la recherche:" -ForegroundColor Red
    Write-Host $searchResult -ForegroundColor Red
    exit 1
}

if ([string]::IsNullOrWhiteSpace($searchResult)) {
    Write-Host "Aucun credential trouve contenant localhost:5678" -ForegroundColor Yellow
    Write-Host "Les credentials peuvent etre chiffres. Tentative de mise a jour directe..." -ForegroundColor Yellow
} else {
    Write-Host "Credentials trouves:" -ForegroundColor Green
    Write-Host $searchResult -ForegroundColor Gray
    Write-Host ""
}

Write-Host "Etape 2: Mise a jour des credentials..." -ForegroundColor Yellow

# Mettre a jour les credentials en remplacant localhost:5678 par n8n.regispailler.fr
# Note: Les donnees peuvent etre chiffrees, donc on utilise REPLACE sur le texte brut
$updateQuery = @"
UPDATE credentials_entity 
SET "data" = REPLACE(
    REPLACE(
        REPLACE("data"::text, 'http://localhost:5678', 'https://n8n.regispailler.fr'),
        'https://localhost:5678', 
        'https://n8n.regispailler.fr'
    ),
    'localhost:5678',
    'n8n.regispailler.fr'
)::jsonb
WHERE "data"::text LIKE '%localhost:5678%';
"@

$updateResult = docker exec -i n8n-postgres psql -U n8n -d n8ndb -c $updateQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    $affectedRows = ($updateResult | Select-String -Pattern "UPDATE (\d+)" | ForEach-Object { $_.Matches.Groups[1].Value })
    if ($affectedRows -and [int]$affectedRows -gt 0) {
        Write-Host "OK: $affectedRows credential(s) mis a jour avec succes !" -ForegroundColor Green
    } else {
        Write-Host "Aucun credential modifie (peut-etre deja a jour ou chiffre)" -ForegroundColor Yellow
    }
} else {
    Write-Host "ERREUR lors de la mise a jour:" -ForegroundColor Red
    Write-Host $updateResult -ForegroundColor Red
    Write-Host ""
    Write-Host "Les credentials peuvent etre chiffres. Dans ce cas, vous devrez les mettre a jour manuellement via l'interface n8n." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Etape 3: Verification..." -ForegroundColor Yellow

# Verifier que la mise a jour a fonctionne
$verifyQuery = @"
SELECT COUNT(*) 
FROM credentials_entity 
WHERE "data"::text LIKE '%localhost:5678%';
"@

$verifyResult = docker exec -i n8n-postgres psql -U n8n -d n8ndb -t -A -c $verifyQuery 2>&1

if ($LASTEXITCODE -eq 0) {
    $remainingCount = $verifyResult.Trim()
    if ([int]$remainingCount -eq 0) {
        Write-Host "OK: Aucun credential ne contient plus localhost:5678" -ForegroundColor Green
    } else {
        Write-Host "ATTENTION: $remainingCount credential(s) contiennent encore localhost:5678" -ForegroundColor Yellow
        Write-Host "Ces credentials sont probablement chiffres. Mettez-les a jour manuellement via l'interface n8n." -ForegroundColor Yellow
    }
} else {
    Write-Host "Impossible de verifier (non critique)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Mise a jour terminee !" -ForegroundColor Cyan
Write-Host "Redemarrez le conteneur n8n pour appliquer les changements:" -ForegroundColor Yellow
Write-Host "   docker restart n8n" -ForegroundColor White
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
