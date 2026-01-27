# Script pour mettre a jour l'URL de redirection OAuth dans les credentials n8n via l'API
# Remplace localhost:5678 par n8n.regispailler.fr dans les credentials OAuth2

param(
    [string]$N8nUrl = "https://n8n.regispailler.fr",
    [string]$Email = "admin@regispailler.fr",
    [string]$Password = ""
)

Write-Host "Mise a jour des credentials OAuth2 n8n via l'API..." -ForegroundColor Cyan
Write-Host ""

# Si le mot de passe n'est pas fourni, le demander
if ([string]::IsNullOrWhiteSpace($Password)) {
    $securePassword = Read-Host "Entrez le mot de passe pour $Email" -AsSecureString
    $BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($securePassword)
    $Password = [System.Runtime.InteropServices.Marshal]::PtrToStringAuto($BSTR)
}

Write-Host "Etape 1: Authentification aupres de n8n..." -ForegroundColor Yellow

# Obtenir le cookie de session
$loginBody = @{
    email = $Email
    password = $Password
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri "$N8nUrl/rest/login" `
        -Method POST `
        -Body $loginBody `
        -ContentType "application/json" `
        -SessionVariable session `
        -ErrorAction Stop

    Write-Host "OK: Authentification reussie" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Impossible de s'authentifier" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Etape 2: Recuperation des credentials..." -ForegroundColor Yellow

# Recuperer tous les credentials
try {
    $credentialsResponse = Invoke-WebRequest -Uri "$N8nUrl/rest/credentials" `
        -Method GET `
        -WebSession $session `
        -ErrorAction Stop

    $credentials = ($credentialsResponse.Content | ConvertFrom-Json).data

    Write-Host "OK: $($credentials.Count) credential(s) trouve(s)" -ForegroundColor Green
} catch {
    Write-Host "ERREUR: Impossible de recuperer les credentials" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Etape 3: Recherche des credentials OAuth2 contenant localhost:5678..." -ForegroundColor Yellow

$credentialsToUpdate = @()

foreach ($credential in $credentials) {
    $credentialData = $credential.data | ConvertTo-Json -Depth 10
    if ($credentialData -match "localhost:5678") {
        $credentialsToUpdate += $credential
        Write-Host "  - $($credential.name) (type: $($credential.type))" -ForegroundColor Yellow
    }
}

if ($credentialsToUpdate.Count -eq 0) {
    Write-Host "Aucun credential trouve contenant localhost:5678" -ForegroundColor Green
    Write-Host "Les credentials sont peut-etre deja a jour." -ForegroundColor Green
    exit 0
}

Write-Host ""
Write-Host "Etape 4: Mise a jour des credentials..." -ForegroundColor Yellow

$updatedCount = 0
foreach ($credential in $credentialsToUpdate) {
    Write-Host "  Mise a jour de: $($credential.name)..." -ForegroundColor Gray
    
    # Convertir les donnees en JSON et remplacer localhost:5678
    $updatedData = $credential.data | ConvertTo-Json -Depth 10
    $updatedData = $updatedData -replace "http://localhost:5678", "https://n8n.regispailler.fr"
    $updatedData = $updatedData -replace "https://localhost:5678", "https://n8n.regispailler.fr"
    $updatedData = $updatedData -replace "localhost:5678", "n8n.regispailler.fr"
    
    $updateBody = @{
        id = $credential.id
        name = $credential.name
        type = $credential.type
        data = ($updatedData | ConvertFrom-Json)
        nodesAccess = $credential.nodesAccess
    } | ConvertTo-Json -Depth 10

    try {
        $updateResponse = Invoke-WebRequest -Uri "$N8nUrl/rest/credentials/$($credential.id)" `
            -Method PUT `
            -Body $updateBody `
            -ContentType "application/json" `
            -WebSession $session `
            -ErrorAction Stop

        Write-Host "    OK: Mis a jour avec succes" -ForegroundColor Green
        $updatedCount++
    } catch {
        Write-Host "    ERREUR: Impossible de mettre a jour" -ForegroundColor Red
        Write-Host "    $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Mise a jour terminee !" -ForegroundColor Cyan
Write-Host "  Credentials mis a jour: $updatedCount/$($credentialsToUpdate.Count)" -ForegroundColor $(if ($updatedCount -eq $credentialsToUpdate.Count) { "Green" } else { "Yellow" })
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Redemarrez le conteneur n8n pour appliquer les changements:" -ForegroundColor Yellow
Write-Host "   docker restart n8n" -ForegroundColor White
Write-Host ""
