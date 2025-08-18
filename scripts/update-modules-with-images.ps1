# Script PowerShell pour mettre à jour les modules avec leurs images JPG
# Ce script élimine les zones noires en utilisant des images JPG simples

Write-Host "Mise à jour des modules avec leurs images JPG..." -ForegroundColor Blue

# Vérifier si Docker est en cours d'exécution
$dockerRunning = docker ps --format "table {{.Names}}" 2>$null | Select-String "postgres"
if (-not $dockerRunning) {
    Write-Host "PostgreSQL n'est pas en cours d'exécution. Démarrage de Docker..." -ForegroundColor Red
    docker-compose -f docker-compose.local.yml up -d postgres
    Start-Sleep -Seconds 10
}

# Attendre que PostgreSQL soit prêt
Write-Host "Attente que PostgreSQL soit prêt..." -ForegroundColor Yellow
$maxAttempts = 30
$attempt = 0
do {
    $attempt++
    $result = docker exec iahome-postgres-1 pg_isready -U postgres 2>$null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "PostgreSQL est prêt!" -ForegroundColor Green
        break
    }
    Write-Host "Tentative $attempt/$maxAttempts..." -ForegroundColor Yellow
    Start-Sleep -Seconds 2
} while ($attempt -lt $maxAttempts)

if ($attempt -eq $maxAttempts) {
    Write-Host "Impossible de se connecter à PostgreSQL" -ForegroundColor Red
    exit 1
}

# Exécuter le script SQL
Write-Host "Exécution du script SQL pour mettre à jour les modules..." -ForegroundColor Blue

$sqlScript = Get-Content "scripts/add-all-modules-with-images.sql" -Raw

try {
    $result = docker exec -i iahome-postgres-1 psql -U postgres -d iahome -c $sqlScript 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Modules mis à jour avec succès!" -ForegroundColor Green
        Write-Host "Résultat:" -ForegroundColor Cyan
        Write-Host $result -ForegroundColor White
    } else {
        Write-Host "Erreur lors de la mise à jour des modules:" -ForegroundColor Red
        Write-Host $result -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de l'exécution du script SQL:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

# Vérifier les modules mis à jour
Write-Host "Vérification des modules mis à jour..." -ForegroundColor Blue

$checkQuery = "SELECT id, title, category, price, image_url, CASE WHEN price = 0.00 THEN 'Free' ELSE CONCAT(price::text, ' EUR') END as display_price FROM modules ORDER BY title;"

try {
    $checkResult = docker exec -i iahome-postgres-1 psql -U postgres -d iahome -c $checkQuery 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Vérification réussie!" -ForegroundColor Green
        Write-Host "Modules disponibles:" -ForegroundColor Cyan
        Write-Host $checkResult -ForegroundColor White
    } else {
        Write-Host "Erreur lors de la vérification:" -ForegroundColor Red
        Write-Host $checkResult -ForegroundColor Red
    }
} catch {
    Write-Host "Erreur lors de la vérification:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
}

Write-Host "Mise à jour terminée!" -ForegroundColor Green
Write-Host "Les zones noires ont été remplacées par des images JPG simples." -ForegroundColor Cyan
