# Script PowerShell pour démarrer le service Game Console Reservation
# Frontend sur port 5000, Backend sur port 5001

Write-Host "🚀 Démarrage du service Game Console Reservation" -ForegroundColor Cyan
Write-Host ""

# Vérifier si les ports sont déjà utilisés
Write-Host "📋 Vérification des ports..." -ForegroundColor Yellow
$port5000 = Get-NetTCPConnection -LocalPort 5000 -ErrorAction SilentlyContinue
$port5001 = Get-NetTCPConnection -LocalPort 5001 -ErrorAction SilentlyContinue

if ($port5000) {
    Write-Host "⚠️  Le port 5000 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Arrêtez le processus ou changez le port" -ForegroundColor Gray
}

if ($port5001) {
    Write-Host "⚠️  Le port 5001 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Arrêtez le processus ou changez le port" -ForegroundColor Gray
}

if ($port5000 -or $port5001) {
    Write-Host ""
    $continue = Read-Host "Continuer quand même ? (O/N)"
    if ($continue -ne "O" -and $continue -ne "o") {
        exit
    }
}

Write-Host ""
Write-Host "🔧 Démarrage du backend (port 5001)..." -ForegroundColor Green
$backendPath = Join-Path $PSScriptRoot "GameConsoleReservation-Web\backend"

if (-not (Test-Path $backendPath)) {
    Write-Host "❌ Erreur: Le dossier backend n'existe pas: $backendPath" -ForegroundColor Red
    exit 1
}

# Vérifier si node_modules existe
$nodeModulesPath = Join-Path $backendPath "node_modules"
if (-not (Test-Path $nodeModulesPath)) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    Push-Location $backendPath
    npm install
    Pop-Location
}

# Démarrer le backend dans une nouvelle fenêtre
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$backendPath'; Write-Host '🚀 Backend démarré sur le port 5001' -ForegroundColor Green; npm start"

Write-Host "✅ Backend démarré (fenêtre séparée)" -ForegroundColor Green
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "🌐 Démarrage du frontend (port 5000)..." -ForegroundColor Green
$frontendPath = Join-Path $PSScriptRoot "GameConsoleReservation-Web"

if (-not (Test-Path $frontendPath)) {
    Write-Host "❌ Erreur: Le dossier frontend n'existe pas: $frontendPath" -ForegroundColor Red
    exit 1
}

# Démarrer le frontend dans une nouvelle fenêtre
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$frontendPath'; Write-Host '🌐 Frontend démarré sur le port 5000' -ForegroundColor Green; Write-Host 'Ouvrez http://localhost:5000 dans votre navigateur' -ForegroundColor Cyan; python -m http.server 5000"

Write-Host "✅ Frontend démarré (fenêtre séparée)" -ForegroundColor Green

Write-Host ""
Write-Host "✅ Services démarrés !" -ForegroundColor Green
Write-Host ""
Write-Host "📡 URLs disponibles:" -ForegroundColor Cyan
Write-Host "   - Frontend: http://localhost:5000" -ForegroundColor White
Write-Host "   - Backend API: http://localhost:5001/api" -ForegroundColor White
Write-Host "   - Health Check: http://localhost:5001/api/health" -ForegroundColor White
Write-Host ""
Write-Host "🌍 Domaine public:" -ForegroundColor Cyan
Write-Host "   - https://consoles.regispailler.fr" -ForegroundColor White
Write-Host ""
Write-Host "💡 Pour arrêter les services, fermez les fenêtres PowerShell ouvertes" -ForegroundColor Gray

