# Script pour démarrer les services en arrière-plan (sans fenêtres PowerShell)

param(
    [switch]$Stop,
    [switch]$Status
)

$ErrorActionPreference = "Stop"

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$BackendPath = Join-Path $RootPath "C:\Users\AAA\Documents\GameConsoleReservation-Web\backend"
$FrontendPath = Join-Path $RootPath "C:\Users\AAA\Documents\GameConsoleReservation-Web"

$FrontendPort = 5000
$BackendPort = 5001

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Stop-Port {
    param([int]$Port)
    $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $process = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
            if ($process -and $process.ProcessName -ne "cloudflared") {
                Write-Host "Arrêt du processus sur le port $Port : $($process.ProcessName) (PID: $($process.Id))" -ForegroundColor Yellow
                Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
            }
        }
        Start-Sleep -Seconds 2
    }
}

function Test-ServiceHealth {
    param([string]$Url, [int]$TimeoutSeconds = 5)
    try {
        $response = Invoke-WebRequest -Uri $Url -TimeoutSec $TimeoutSeconds -UseBasicParsing -ErrorAction Stop
        return $response.StatusCode -eq 200
    } catch {
        return $false
    }
}

if ($Stop) {
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
    
    # Arrêter les processus Python liés au frontend
    Get-Process | Where-Object {
        $_.ProcessName -eq "python" -and
        $_.CommandLine -like "*http.server*5000*"
    } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Success "Tous les services arrêtés"
    return
}

if ($Status) {
    Write-Step "📊 Statut des services" "Cyan"
    
    Write-Host "`nBackend (port $BackendPort):" -ForegroundColor Yellow
    if (Test-ServiceHealth -Url "http://localhost:$BackendPort/api/health") {
        Write-Success "✅ Opérationnel"
    } else {
        Write-Host "❌ Non accessible" -ForegroundColor Red
    }
    
    Write-Host "`nFrontend (port $FrontendPort):" -ForegroundColor Yellow
    if (Test-ServiceHealth -Url "http://localhost:$FrontendPort") {
        Write-Success "✅ Opérationnel"
    } else {
        Write-Host "❌ Non accessible" -ForegroundColor Red
    }
    
    return
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Démarrage des services en arrière-plan              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Arrêter les processus existants
Stop-Port -Port $BackendPort
Stop-Port -Port $FrontendPort

# Démarrer le backend en arrière-plan
Write-Step "🔧 Démarrage du backend (port $BackendPort)..." "Green"

if (-not (Test-Path (Join-Path $BackendPath "node_modules"))) {
    Write-Host "📦 Installation des dépendances npm..." -ForegroundColor Yellow
    Push-Location $BackendPath
    npm install
    Pop-Location
}

$backendScript = @"
cd '$BackendPath'
`$env:PORT = '$BackendPort'
node server.js
"@

# Démarrer en arrière-plan sans fenêtre
$backendProcess = Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", $backendScript -PassThru
Write-Success "Backend démarré (PID: $($backendProcess.Id))"

Start-Sleep -Seconds 3

# Démarrer le frontend en arrière-plan
Write-Step "🌐 Démarrage du frontend (port $FrontendPort)..." "Green"

$frontendScript = @"
cd '$FrontendPath'
python -m http.server $FrontendPort
"@

# Démarrer en arrière-plan sans fenêtre
$frontendProcess = Start-Process powershell -ArgumentList "-WindowStyle Hidden", "-Command", $frontendScript -PassThru
Write-Success "Frontend démarré (PID: $($frontendProcess.Id))"

Start-Sleep -Seconds 2

# Vérifier que les services fonctionnent
Write-Step "🧪 Vérification des services..." "Cyan"

$backendOk = $false
$frontendOk = $false

for ($i = 0; $i -lt 10; $i++) {
    if (-not $backendOk) {
        $backendOk = Test-ServiceHealth -Url "http://localhost:$BackendPort/api/health"
    }
    if (-not $frontendOk) {
        $frontendOk = Test-ServiceHealth -Url "http://localhost:$FrontendPort"
    }
    if ($backendOk -and $frontendOk) {
        break
    }
    Start-Sleep -Seconds 1
}

if ($backendOk -and $frontendOk) {
    Write-Step "✅ Tous les services sont démarrés en arrière-plan !" "Green"
    Write-Host "`n📊 PIDs des processus :" -ForegroundColor Cyan
    Write-Host "   - Backend: $($backendProcess.Id)" -ForegroundColor White
    Write-Host "   - Frontend: $($frontendProcess.Id)" -ForegroundColor White
    Write-Host "`n💡 Pour arrêter les services :" -ForegroundColor Cyan
    Write-Host "   .\start-consoles-background.ps1 -Stop" -ForegroundColor Gray
    Write-Host "`n💡 Pour vérifier le statut :" -ForegroundColor Cyan
    Write-Host "   .\start-consoles-background.ps1 -Status" -ForegroundColor Gray
} else {
    Write-Host "`n⚠️ Certains services n'ont pas démarré correctement" -ForegroundColor Yellow
    Write-Host "   Backend: $(if ($backendOk) {'✅'} else {'❌'})" -ForegroundColor $(if ($backendOk) {'Green'} else {'Red'})
    Write-Host "   Frontend: $(if ($frontendOk) {'✅'} else {'❌'})" -ForegroundColor $(if ($frontendOk) {'Green'} else {'Red'})
}























