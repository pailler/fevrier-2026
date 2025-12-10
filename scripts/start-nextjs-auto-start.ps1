# Script pour demarrer l'application Next.js au demarrage de Windows
# Execute automatiquement au demarrage via tache planifiee

$ErrorActionPreference = "Continue"

# Ce script est concu pour etre execute au demarrage de Windows
# Il demarre Next.js en arriere-plan

$RootPath = Split-Path -Parent $PSScriptRoot

# Logger le demarrage
$logFile = Join-Path $RootPath "nextjs-startup.log"
"[$(Get-Date)] Demarrage automatique de Next.js..." | Out-File -FilePath $logFile -Append

# Verifier Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue

if (-not $node -or -not $npm) {
    "[$(Get-Date)] ERREUR: Node.js ou npm non trouve" | Out-File -FilePath $logFile -Append
    exit 1
}

# Verifier package.json
$packageJson = Join-Path $RootPath "package.json"
if (-not (Test-Path $packageJson)) {
    "[$(Get-Date)] ERREUR: package.json introuvable" | Out-File -FilePath $logFile -Append
    exit 1
}

# Verifier si Next.js est deja en cours d'execution
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $proc = Get-Process -Id $port3000.OwningProcess -ErrorAction SilentlyContinue
    if ($proc -and $proc.ProcessName -eq "node") {
        # Deja demarre, ne rien faire
        "[$(Get-Date)] Next.js deja en cours d'execution (PID: $($proc.Id))" | Out-File -FilePath $logFile -Append
        exit 0
    }
}

# Changer vers le repertoire racine
Push-Location $RootPath

try {
    # Configurer les variables d'environnement
    $env:NODE_ENV = "production"
    $env:PORT = "3000"
    
    # Demarrer Next.js en arriere-plan
    $nextjsScript = @"
cd '$RootPath'
`$env:NODE_ENV='production'
`$env:PORT='3000'
npm start
"@
    
    $process = Start-Process powershell `
        -ArgumentList "-NoExit", "-WindowStyle", "Hidden", "-Command", $nextjsScript `
        -PassThru `
        -ErrorAction Stop
    
    # Sauvegarder le PID pour reference
    $pidFile = Join-Path $RootPath "nextjs.pid"
    $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
    
    # Logger le demarrage
    "[$(Get-Date)] Next.js demarre (PID: $($process.Id))" | Out-File -FilePath $logFile -Append
    
} catch {
    # Logger l'erreur
    "[$(Get-Date)] ERREUR: $($_.Exception.Message)" | Out-File -FilePath $logFile -Append
} finally {
    Pop-Location
}














