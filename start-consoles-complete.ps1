# Script complet pour démarrer Game Console Reservation
# Gère automatiquement le démarrage, la vérification et la gestion des services

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$Restart
)

$ErrorActionPreference = "Stop"

# Chemins
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $RootPath "GameConsoleReservation-Web\backend"
$FrontendPath = Join-Path $RootPath "GameConsoleReservation-Web"

# Ports
$FrontendPort = 5000
$BackendPort = 5001

# Fonction pour afficher les messages
function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

# Fonction pour arrêter les processus sur un port
function Stop-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process) {
                Write-Warning "Arrêt du processus sur le port $Port : $($process.ProcessName) (PID: $($process.Id))"
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 2
    }
}

# Fonction pour vérifier si un port est libre
function Test-PortFree {
    param([int]$Port)
    $connection = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
    return -not $connection
}

# Fonction pour vérifier si un service répond
function Test-ServiceHealth {
    param([string]$Url, [int]$TimeoutSeconds = 5)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

# Fonction pour démarrer le backend
function Start-Backend {
    Write-Step "🔧 Démarrage du backend (port $BackendPort)..." "Green"
    
    # Vérifier les dépendances
    if (-not (Test-Path (Join-Path $BackendPath "node_modules"))) {
        Write-Warning "Installation des dépendances npm..."
        Push-Location $BackendPath
        npm install
        Pop-Location
    }
    
    # Arrêter les processus existants sur le port
    Stop-Port -Port $BackendPort
    
    # Vérifier que le port est libre
    if (-not (Test-PortFree -Port $BackendPort)) {
        Write-Error "Le port $BackendPort est toujours occupé"
        return $false
    }
    
    # Démarrer le backend
    $backendScript = @"
cd '$BackendPath'
`$env:PORT = '$BackendPort'
Write-Host '🚀 Backend démarré sur le port $BackendPort' -ForegroundColor Green
Write-Host '📡 API: http://localhost:$BackendPort/api' -ForegroundColor Cyan
Write-Host '🔗 Health: http://localhost:$BackendPort/api/health' -ForegroundColor Cyan
Write-Host ''
node server.js
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $backendScript
    Start-Sleep -Seconds 3
    
    # Vérifier que le backend répond
    $maxRetries = 10
    $retry = 0
    while ($retry -lt $maxRetries) {
        if (Test-ServiceHealth -Url "http://localhost:$BackendPort/api/health") {
            Write-Success "Backend opérationnel sur le port $BackendPort"
            return $true
        }
        $retry++
        Start-Sleep -Seconds 1
    }
    
    Write-Error "Le backend n'a pas démarré correctement"
    return $false
}

# Fonction pour démarrer le frontend
function Start-Frontend {
    Write-Step "🌐 Démarrage du frontend (port $FrontendPort)..." "Green"
    
    # Arrêter les processus existants sur le port
    Stop-Port -Port $FrontendPort
    
    # Vérifier que le port est libre
    if (-not (Test-PortFree -Port $FrontendPort)) {
        Write-Error "Le port $FrontendPort est toujours occupé"
        return $false
    }
    
    # Vérifier que Python est disponible
    try {
        $pythonVersion = python --version 2>&1
        Write-Success "Python détecté: $pythonVersion"
    } catch {
        Write-Error "Python n'est pas installé ou pas dans le PATH"
        return $false
    }
    
    # Démarrer le frontend
    $frontendScript = @"
cd '$FrontendPath'
Write-Host '🌐 Frontend démarré sur le port $FrontendPort' -ForegroundColor Green
Write-Host '📡 URL: http://localhost:$FrontendPort' -ForegroundColor Cyan
Write-Host '🌍 Public: https://consoles.regispailler.fr' -ForegroundColor Cyan
Write-Host ''
python -m http.server $FrontendPort
"@
    
    Start-Process powershell -ArgumentList "-NoExit", "-Command", $frontendScript
    Start-Sleep -Seconds 2
    
    # Vérifier que le frontend répond
    $maxRetries = 5
    $retry = 0
    while ($retry -lt $maxRetries) {
        if (Test-ServiceHealth -Url "http://localhost:$FrontendPort") {
            Write-Success "Frontend opérationnel sur le port $FrontendPort"
            return $true
        }
        $retry++
        Start-Sleep -Seconds 1
    }
    
    Write-Error "Le frontend n'a pas démarré correctement"
    return $false
}

# Fonction pour afficher le statut
function Show-Status {
    Write-Step "📊 Statut des services" "Cyan"
    
    Write-Host "`nBackend (port $BackendPort):" -ForegroundColor Yellow
    if (Test-ServiceHealth -Url "http://localhost:$BackendPort/api/health") {
        Write-Success "✅ Opérationnel"
        try {
            $health = Invoke-RestMethod -Uri "http://localhost:$BackendPort/api/health" -UseBasicParsing
            Write-Host "   Message: $($health.message)" -ForegroundColor Gray
            Write-Host "   Port: $($health.port)" -ForegroundColor Gray
        } catch {}
    } else {
        Write-Error "❌ Non accessible"
    }
    
    Write-Host "`nFrontend (port $FrontendPort):" -ForegroundColor Yellow
    if (Test-ServiceHealth -Url "http://localhost:$FrontendPort") {
        Write-Success "✅ Opérationnel"
    } else {
        Write-Error "❌ Non accessible"
    }
    
    Write-Host "`nURLs disponibles:" -ForegroundColor Cyan
    Write-Host "   - Frontend local: http://localhost:$FrontendPort" -ForegroundColor White
    Write-Host "   - Backend local: http://localhost:$BackendPort/api" -ForegroundColor White
    Write-Host "   - Health check: http://localhost:$BackendPort/api/health" -ForegroundColor White
    Write-Host "   - Domaine public: https://consoles.regispailler.fr" -ForegroundColor White
}

# Fonction pour arrêter tous les services
function Stop-All {
    Write-Step "🛑 Arrêt de tous les services..." "Yellow"
    
    Stop-Port -Port $BackendPort
    Stop-Port -Port $FrontendPort
    
    # Arrêter les processus Node.js liés au backend
    Get-Process | Where-Object {
        $_.ProcessName -eq "node" -and 
        $_.Path -notlike "*cursor*" -and
        $_.Path -notlike "*StreamDeck*"
    } | Where-Object {
        $_.CommandLine -like "*server.js*" -or
        $_.CommandLine -like "*GameConsoleReservation*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Success "Tous les services arrêtés"
}

# Fonction principale
function Main {
    Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║  Game Console Reservation - Gestionnaire de Services  ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
    
    if ($Stop) {
        Stop-All
        return
    }
    
    if ($Status) {
        Show-Status
        return
    }
    
    if ($Restart) {
        Stop-All
        Start-Sleep -Seconds 2
    }
    
    # Démarrer les services
    $backendOk = Start-Backend
    $frontendOk = Start-Frontend
    
    if ($backendOk -and $frontendOk) {
        Write-Step "✅ Tous les services sont démarrés !" "Green"
        Show-Status
        Write-Host "`n💡 Commandes utiles:" -ForegroundColor Cyan
        Write-Host "   - Statut: .\start-consoles-complete.ps1 -Status" -ForegroundColor Gray
        Write-Host "   - Arrêter: .\start-consoles-complete.ps1 -Stop" -ForegroundColor Gray
        Write-Host "   - Redémarrer: .\start-consoles-complete.ps1 -Restart" -ForegroundColor Gray
    } else {
        Write-Error "Certains services n'ont pas démarré correctement"
        exit 1
    }
}

# Exécuter la fonction principale
Main

