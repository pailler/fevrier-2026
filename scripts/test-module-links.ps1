# Script de test pour verifier les liens des modules
Write-Host "Test des liens des modules..." -ForegroundColor Cyan

# Verifier que nous sommes dans le bon repertoire
if (-not (Test-Path "package.json")) {
    Write-Host "Erreur: Ce script doit etre execute depuis le repertoire racine du projet" -ForegroundColor Red
    exit 1
}

# Test de la page d'accueil
Write-Host "Test de la page d'accueil:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "Page d'accueil accessible" -ForegroundColor Green
    } else {
        Write-Host "Page d'accueil (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Page d'accueil inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'API Health
Write-Host "Test de l'API Health:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "API Health accessible" -ForegroundColor Green
    } else {
        Write-Host "API Health (Status: $($response.StatusCode))" -ForegroundColor Yellow
    }
} catch {
    Write-Host "API Health inaccessible: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "Test des liens termine!" -ForegroundColor Green
Write-Host "Pour tester manuellement:" -ForegroundColor Cyan
Write-Host "Visitez: https://iahome.fr" -ForegroundColor White
Write-Host "Cliquez sur les images des modules" -ForegroundColor White
Write-Host "Testez les boutons Acces rapide et Details" -ForegroundColor White





