# Script pour démarrer Home Assistant en arrière-plan
# Fonctionne sans ouvrir de fenêtres PowerShell

$ErrorActionPreference = "Stop"
# Le script est dans scripts/, donc on remonte d'un niveau pour avoir la racine du projet
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = Split-Path -Parent $ScriptPath

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "⚠️  $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

Write-Step "🏠 Démarrage de Home Assistant en arrière-plan..." "Cyan"

# Vérifier si le port 8123 est déjà utilisé
$portInUse = Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue

if ($portInUse) {
    Write-Warning "Le port 8123 est déjà utilisé"
    $process = Get-Process -Id ($portInUse.OwningProcess) -ErrorAction SilentlyContinue
    if ($process) {
        Write-Info "Arrêt du processus existant (PID: $($process.Id))..."
        Stop-Process -Id $process.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Success "Processus arrêté"
    }
}

# Chemin vers le dossier codes-ha
$codesHaPath = Join-Path $RootPath "essentiels\codes-ha"
if (-not (Test-Path $codesHaPath)) {
    Write-Error "Dossier introuvable: $codesHaPath"
    exit 1
}

# Vérifier si Python est disponible
$pythonVersion = python --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Error "Python n'est pas installé ou pas dans le PATH"
    Write-Info "Installez Python depuis https://www.python.org/downloads/"
    exit 1
}

Write-Success "Python détecté: $pythonVersion"

# Démarrer le serveur HTTP Python en arrière-plan
Write-Info "Démarrage du serveur HTTP sur le port 8123..."

try {
    # Créer un script temporaire pour démarrer le serveur
    $timestamp = Get-Date -Format "yyyyMMddHHmmss"
    $tempScript = Join-Path $env:TEMP "start-homeassistant-$timestamp.ps1"
    $scriptContent = @"
Set-Location "$codesHaPath"
python -m http.server 8123
"@
    $scriptContent | Out-File -FilePath $tempScript -Encoding UTF8
    
    # Démarrer le serveur dans une fenêtre PowerShell minimisée (en arrière-plan)
    $process = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Hidden", "-File", $tempScript -PassThru -WindowStyle Hidden
    
    if ($process) {
        Write-Success "Home Assistant démarré en arrière-plan (PID: $($process.Id))"
        Write-Info "Attente du démarrage du serveur..."
        
        # Attendre que le serveur démarre
        $maxRetries = 10
        $retryCount = 0
        $isRunning = $false
        
        while ($retryCount -lt $maxRetries -and -not $isRunning) {
            Start-Sleep -Seconds 2
            try {
                $response = Invoke-WebRequest -Uri "http://localhost:8123" -Method Head -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
                if ($response.StatusCode -eq 200) {
                    $isRunning = $true
                    Write-Success "Home Assistant répond : HTTP $($response.StatusCode)"
                }
            } catch {
                $retryCount++
                if ($retryCount -lt $maxRetries) {
                    Write-Info "Attente du démarrage... ($retryCount/$maxRetries)"
                }
            }
        }
        
        if (-not $isRunning) {
            Write-Warning "Le serveur démarre encore (peut prendre quelques secondes)"
            Write-Info "Vérifiez manuellement : http://localhost:8123"
        }
        
        Write-Success "Home Assistant est accessible sur http://localhost:8123"
        Write-Success "Production: https://homeassistant.iahome.fr"
    } else {
        Write-Error "Impossible de démarrer le serveur"
        exit 1
    }
} catch {
    Write-Error "Erreur lors du démarrage du serveur: $_"
    exit 1
}






