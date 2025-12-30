# Script robuste pour reparer et demarrer Next.js sur le port 3000
# Gere toutes les etapes : nettoyage, verification, construction, demarrage

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  REPARATION ET DEMARRAGE NEXT.JS       " -ForegroundColor Cyan
Write-Host "  Port 3000 (iahome.fr)                " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

# Fonction pour afficher les etapes
function Write-Step {
    param([string]$Message, [string]$Color = "Yellow")
    Write-Host ""
    Write-Host "[ETAPE] $Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "  [OK] $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [ERREUR] $Message" -ForegroundColor Red
}

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor Gray
}

# ============================================
# ETAPE 1 : Verification de l'environnement
# ============================================
Write-Step "1. Verification de l'environnement" "Cyan"

$node = Get-Command node -ErrorAction SilentlyContinue
$npm = Get-Command npm -ErrorAction SilentlyContinue

if (-not $node) {
    Write-Error "Node.js non trouve"
    Write-Host ""
    Write-Host "Installez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

if (-not $npm) {
    Write-Error "npm non trouve"
    Write-Host ""
    Write-Host "Installez Node.js (npm est inclus) depuis: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Success "Node.js: $($node.Version)"
Write-Success "npm: $($npm.Version)"

$packageJson = Join-Path $RootPath "package.json"
if (-not (Test-Path $packageJson)) {
    Write-Error "package.json introuvable: $packageJson"
    pause
    exit 1
}
Write-Success "package.json trouve"

# ============================================
# ETAPE 2 : Nettoyage des processus existants
# ============================================
Write-Step "2. Nettoyage des processus existants" "Cyan"

# Arreter les processus sur le port 3000
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $proc = Get-Process -Id $port3000.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Write-Info "Arret du processus sur le port 3000 (PID: $($proc.Id))"
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Success "Processus arrete"
    }
} else {
    Write-Success "Port 3000 libre"
}

# Arreter tous les processus node qui pourraient etre lies a Next.js
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*$RootPath*" -or 
    $_.CommandLine -like "*next*" -or
    $_.CommandLine -like "*3000*"
}

if ($nodeProcesses) {
    Write-Info "Arret de $($nodeProcesses.Count) processus Node.js potentiellement lies"
    $nodeProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Success "Processus Node.js arretes"
}

# ============================================
# ETAPE 3 : Verification des dependances
# ============================================
Write-Step "3. Verification des dependances" "Cyan"

$nodeModules = Join-Path $RootPath "node_modules"
if (-not (Test-Path $nodeModules)) {
    Write-Info "node_modules introuvable - Installation des dependances..."
    Write-Host "  Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
    
    Push-Location $RootPath
    npm install
    $installResult = $LASTEXITCODE
    Pop-Location
    
    if ($installResult -ne 0) {
        Write-Error "Echec de l'installation des dependances"
        pause
        exit 1
    }
    Write-Success "Dependances installees"
} else {
    Write-Success "Dependances deja installees"
    
    # Verifier si package.json a ete modifie (comparaison de date)
    $packageJsonDate = (Get-Item $packageJson).LastWriteTime
    $nodeModulesDate = (Get-Item $nodeModules).LastWriteTime
    
    if ($packageJsonDate -gt $nodeModulesDate) {
        Write-Info "package.json plus recent que node_modules - Mise a jour des dependances..."
        Push-Location $RootPath
        npm install
        Pop-Location
        Write-Success "Dependances mises a jour"
    }
}

# ============================================
# ETAPE 4 : Verification et construction du build
# ============================================
Write-Step "4. Verification et construction du build" "Cyan"

$buildPath = Join-Path $RootPath ".next"
$buildNeeded = $false

if (-not (Test-Path $buildPath)) {
    Write-Info "Build non trouve - Construction necessaire"
    $buildNeeded = $true
} else {
    # Verifier si le build est a jour
    $srcPath = Join-Path $RootPath "src"
    if (Test-Path $srcPath) {
        $srcLastModified = (Get-ChildItem -Path $srcPath -Recurse -File | 
            Sort-Object LastWriteTime -Descending | 
            Select-Object -First 1).LastWriteTime
        
        $buildLastModified = (Get-Item $buildPath).LastWriteTime
        
        if ($srcLastModified -gt $buildLastModified) {
            Write-Info "Code source plus recent que le build - Reconstruction necessaire"
            $buildNeeded = $true
        } else {
            Write-Success "Build a jour"
        }
    } else {
        Write-Success "Build existe"
    }
}

if ($buildNeeded) {
    Write-Info "Construction de l'application Next.js..."
    Write-Host "  Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
    
    Push-Location $RootPath
    
    # Nettoyer le cache Next.js si necessaire
    $nextCache = Join-Path $RootPath ".next"
    if (Test-Path $nextCache) {
        Write-Info "Nettoyage de l'ancien build..."
        Remove-Item -Path $nextCache -Recurse -Force -ErrorAction SilentlyContinue
    }
    
    # Construire l'application
    $env:NODE_ENV = "production"
    npm run build
    
    $buildResult = $LASTEXITCODE
    Pop-Location
    
    if ($buildResult -ne 0) {
        Write-Error "Echec de la construction"
        Write-Host ""
        Write-Host "Verifiez les erreurs ci-dessus et corrigez-les avant de reessayer." -ForegroundColor Yellow
        pause
        exit 1
    }
    
    Write-Success "Build termine avec succes"
}

# ============================================
# ETAPE 5 : Demarrage de l'application
# ============================================
Write-Step "5. Demarrage de l'application Next.js" "Cyan"

Write-Info "Mode: production"
Write-Info "Port: 3000"
Write-Info "URL: http://localhost:3000"
Write-Host ""

# Configurer les variables d'environnement
$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:HOSTNAME = "0.0.0.0"

# Creer un script de demarrage
$startScript = @"
cd '$RootPath'
`$env:NODE_ENV='production'
`$env:PORT='3000'
`$env:HOSTNAME='0.0.0.0'
npm start
"@

# Demarrer Next.js dans une nouvelle fenetre PowerShell
Write-Info "Demarrage de Next.js..."
$process = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Normal", "-Command", $startScript -PassThru -ErrorAction Stop

if (-not $process) {
    Write-Error "Impossible de demarrer le processus"
    pause
    exit 1
}

Write-Success "Processus demarre (PID: $($process.Id))"
Write-Info "Une fenetre PowerShell affiche les logs de Next.js"
Write-Host ""

# ============================================
# ETAPE 6 : Verification que l'application repond
# ============================================
Write-Step "6. Verification que l'application repond" "Cyan"

Write-Info "Attente du demarrage (30 secondes)..."
Start-Sleep -Seconds 10

$maxRetries = 10
$retryCount = 0
$isRunning = $false
$finalStatus = ""

while ($retryCount -lt $maxRetries -and -not $isRunning) {
    try {
        # Verifier que le port est utilise
        $portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
        if ($portCheck) {
            # Essayer de se connecter a l'application
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $isRunning = $true
                $finalStatus = "SUCCES"
            }
        }
    } catch {
        # Continuer a essayer
    }
    
    if (-not $isRunning) {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Info "Attente... ($retryCount/$maxRetries)"
            Start-Sleep -Seconds 3
        }
    }
}

# ============================================
# RESULTAT FINAL
# ============================================
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan

if ($isRunning) {
    Write-Host "  APPLICATION DEMARREE AVEC SUCCES !  " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application accessible sur:" -ForegroundColor Cyan
    Write-Host "  Local:    http://localhost:3000" -ForegroundColor White
    Write-Host "  Externe:  https://iahome.fr" -ForegroundColor White
    Write-Host ""
    Write-Host "Processus:" -ForegroundColor Cyan
    Write-Host "  PID: $($process.Id)" -ForegroundColor White
    Write-Host ""
    Write-Host "La fenetre PowerShell affiche les logs en temps reel." -ForegroundColor Gray
    Write-Host "Ne fermez pas cette fenetre pour garder l'application active." -ForegroundColor Gray
} else {
    Write-Host "  DEMARRAGE EN COURS...                " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "L'application est en cours de demarrage." -ForegroundColor Yellow
    Write-Host "Cela peut prendre 1-2 minutes supplementaires." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifiez:" -ForegroundColor Cyan
    Write-Host "  1. La fenetre PowerShell qui s'est ouverte" -ForegroundColor White
    Write-Host "  2. Les erreurs eventuelles dans les logs" -ForegroundColor White
    Write-Host "  3. L'URL: http://localhost:3000" -ForegroundColor White
    Write-Host ""
    Write-Host "Si l'application ne demarre pas apres 2 minutes," -ForegroundColor Gray
    Write-Host "verifiez les logs dans la fenetre PowerShell." -ForegroundColor Gray
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")








