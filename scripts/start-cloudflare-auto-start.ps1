# Script pour demarrer Cloudflare Tunnel au demarrage de Windows
# Utilise la methode qui fonctionne (demarrage direct sans service Windows)

$ErrorActionPreference = "Continue"

# Ce script est concu pour etre execute au demarrage de Windows
# Il demarre cloudflared en arriere-plan sans service Windows

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"

# Verifier la configuration
if (-not (Test-Path $configPath)) {
    # Logger l'erreur mais ne pas bloquer
    $logFile = Join-Path $RootPath "cloudflared-startup-error.log"
    "[$(Get-Date)] Configuration introuvable: $configPath" | Out-File -FilePath $logFile -Append
    exit 1
}

$configFullPath = (Resolve-Path $configPath).Path

# Verifier cloudflared
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    $logFile = Join-Path $RootPath "cloudflared-startup-error.log"
    "[$(Get-Date)] cloudflared non trouve dans le PATH" | Out-File -FilePath $logFile -Append
    exit 1
}

# Verifier si cloudflared est deja en cours d'execution
$existingProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($existingProcess) {
    # Deja demarre, ne rien faire
    exit 0
}

# Changer vers le repertoire racine
Push-Location $RootPath

try {
    # Methode qui fonctionne: Start-Process simple en arriere-plan
    $process = Start-Process -FilePath $cloudflared.Source `
        -ArgumentList "tunnel", "--config", $configFullPath, "run" `
        -WorkingDirectory $RootPath `
        -WindowStyle Hidden `
        -PassThru `
        -ErrorAction Stop
    
    # Sauvegarder le PID pour reference
    $pidFile = Join-Path $RootPath "cloudflared.pid"
    $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
    
    # Logger le demarrage
    $logFile = Join-Path $RootPath "cloudflared-startup.log"
    "[$(Get-Date)] Cloudflare Tunnel demarre (PID: $($process.Id))" | Out-File -FilePath $logFile -Append
    
} catch {
    # Logger l'erreur
    $logFile = Join-Path $RootPath "cloudflared-startup-error.log"
    "[$(Get-Date)] Erreur: $($_.Exception.Message)" | Out-File -FilePath $logFile -Append
} finally {
    Pop-Location
}














