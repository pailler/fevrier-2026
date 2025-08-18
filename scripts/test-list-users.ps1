# Test simple de l'API list-users
Write-Host "Test de l'API list-users..." -ForegroundColor Green

try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/list-users" -Method GET
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Content: $($response.Content)" -ForegroundColor White
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Status: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
}

Write-Host "Test termine!" -ForegroundColor Green






