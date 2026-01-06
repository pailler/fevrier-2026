# Script pour demarrer Home Assistant au demarrage de Windows
# Execute automatiquement au demarrage via tache planifiee

$ErrorActionPreference = "Continue"

# Ce script est concu pour etre execute au demarrage de Windows
# Il demarre le serveur HTTP Python pour Home Assistant en arriere-plan

$RootPath = Split-Path -Parent $PSScriptRoot

# Logger le demarrage
$logFile = Join-Path $RootPath "homeassistant-startup.log"
"[$(Get-Date)] Demarrage automatique de Home Assistant..." | Out-File -FilePath $logFile -Append

# Verifier Python
$python = Get-Command python -ErrorAction SilentlyContinue
if (-not $python) {
    "[$(Get-Date)] ERREUR: Python non trouve dans le PATH" | Out-File -FilePath $logFile -Append
    exit 1
}

# Verifier le dossier codes-ha
$codesHaPath = Join-Path $RootPath "essentiels\codes-ha"
if (-not (Test-Path $codesHaPath)) {
    "[$(Get-Date)] ERREUR: Dossier codes-ha introuvable: $codesHaPath" | Out-File -FilePath $logFile -Append
    exit 1
}

# Verifier si le port 8123 est deja utilise
$port8123 = Get-NetTCPConnection -LocalPort 8123 -ErrorAction SilentlyContinue
if ($port8123) {
    $proc = Get-Process -Id $port8123.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        # Verifier si c'est deja un serveur Python qui ecoute
        $procPath = $proc.Path
        if ($procPath -like "*python*") {
            # Deja demarre, ne rien faire
            "[$(Get-Date)] Home Assistant deja en cours d'execution (PID: $($proc.Id))" | Out-File -FilePath $logFile -Append
            exit 0
        } else {
            # Un autre processus utilise le port, l'arreter
            "[$(Get-Date)] Arret du processus utilisant le port 8123 (PID: $($proc.Id))" | Out-File -FilePath $logFile -Append
            Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
    }
}

# Changer vers le repertoire codes-ha
Push-Location $codesHaPath

try {
    # Demarrer le serveur HTTP Python en arriere-plan
    $homeAssistantScript = @"
Set-Location '$codesHaPath'
python -m http.server 8123
"@
    
    $process = Start-Process powershell `
        -ArgumentList "-NoExit", "-WindowStyle", "Hidden", "-Command", $homeAssistantScript `
        -PassThru `
        -ErrorAction Stop
    
    # Sauvegarder le PID pour reference
    $pidFile = Join-Path $RootPath "homeassistant.pid"
    $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
    
    # Logger le demarrage
    "[$(Get-Date)] Home Assistant demarre (PID: $($process.Id))" | Out-File -FilePath $logFile -Append
    
    # Attendre un peu et verifier que le serveur repond
    Start-Sleep -Seconds 3
    $maxRetries = 10
    $retryCount = 0
    $isRunning = $false
    
    while ($retryCount -lt $maxRetries -and -not $isRunning) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8123" -Method Head -TimeoutSec 2 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $isRunning = $true
                "[$(Get-Date)] Home Assistant repond : HTTP $($response.StatusCode)" | Out-File -FilePath $logFile -Append
            }
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Start-Sleep -Seconds 2
            }
        }
    }
    
    if ($isRunning) {
        "[$(Get-Date)] Home Assistant demarre avec succes" | Out-File -FilePath $logFile -Append
    } else {
        "[$(Get-Date)] ATTENTION: Home Assistant demarre mais ne repond pas encore" | Out-File -FilePath $logFile -Append
    }
    
} catch {
    # Logger l'erreur
    "[$(Get-Date)] ERREUR: $($_.Exception.Message)" | Out-File -FilePath $logFile -Append
} finally {
    Pop-Location
}
