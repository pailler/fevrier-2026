# Script pour demarrer PsiTransfer
# Verifie Docker et demarre le conteneur

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE PSITRANSFER                 " -ForegroundColor Cyan
Write-Host "  Port 8087 (psitransfer.iahome.fr)     " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$dockerComposePath = Join-Path $RootPath "essentiels\psitransfer\docker-compose.yml"

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

function Write-Info {
    param([string]$Message)
    Write-Host "  [INFO] $Message" -ForegroundColor Gray
}

function Write-Error {
    param([string]$Message)
    Write-Host "  [ERREUR] $Message" -ForegroundColor Red
}

# ============================================
# ETAPE 1 : Verification de Docker
# ============================================
Write-Step "1. Verification de Docker Desktop" "Cyan"

$dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if (-not $dockerDesktop) {
    Write-Info "Docker Desktop n'est pas demarre - Demarrage..."
    $dockerPaths = @(
        "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Programs\Docker\Docker\Docker Desktop.exe"
    )
    
    $dockerStarted = $false
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            Start-Process -FilePath $path -WindowStyle Minimized
            $dockerStarted = $true
            Write-Info "Docker Desktop en cours de demarrage..."
            break
        }
    }
    
    if (-not $dockerStarted) {
        Write-Error "Docker Desktop non trouve"
        Write-Host ""
        Write-Host "Installez Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
        pause
        exit 1
    }
} else {
    Write-Success "Docker Desktop est demarre"
}

# ============================================
# ETAPE 2 : Attente que Docker soit pret
# ============================================
Write-Step "2. Attente que Docker soit pret" "Cyan"

Write-Info "Verification que le daemon Docker repond..."
$maxRetries = 20
$retryCount = 0
$dockerReady = $false

while ($retryCount -lt $maxRetries -and -not $dockerReady) {
    try {
        $dockerInfo = docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            $dockerReady = $true
            Write-Success "Docker est pret"
        } else {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Info "Attente de Docker... ($retryCount/$maxRetries)"
                Start-Sleep -Seconds 3
            }
        }
    } catch {
        $retryCount++
        if ($retryCount -lt $maxRetries) {
            Write-Info "Attente de Docker... ($retryCount/$maxRetries)"
            Start-Sleep -Seconds 3
        }
    }
}

if (-not $dockerReady) {
    Write-Error "Docker n'est pas pret apres $maxRetries tentatives"
    Write-Host ""
    Write-Host "Veuillez attendre que Docker Desktop soit completement demarre" -ForegroundColor Yellow
    Write-Host "puis reessayez." -ForegroundColor Yellow
    pause
    exit 1
}

# ============================================
# ETAPE 3 : Verification du fichier docker-compose
# ============================================
Write-Step "3. Verification de la configuration" "Cyan"

if (-not (Test-Path $dockerComposePath)) {
    Write-Error "Fichier docker-compose.yml non trouve: $dockerComposePath"
    pause
    exit 1
}
Write-Success "Configuration trouvee"

# ============================================
# ETAPE 4 : Verification/Creation du reseau Docker
# ============================================
Write-Step "4. Verification du reseau Docker" "Cyan"

$networkExists = docker network inspect iahome-network 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Info "Creation du reseau iahome-network..."
    docker network create iahome-network 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Success "Reseau cree"
    } else {
        Write-Error "Echec de la creation du reseau"
    }
} else {
    Write-Success "Reseau existe deja"
}

# ============================================
# ETAPE 5 : Arret du conteneur existant (si present)
# ============================================
Write-Step "5. Nettoyage des conteneurs existants" "Cyan"

$existingContainer = docker ps -a --filter "name=psitransfer-iahome" --format "{{.Names}}" 2>&1
if ($existingContainer -and $existingContainer -notmatch "error") {
    Write-Info "Arret et suppression du conteneur existant..."
    docker stop psitransfer-iahome 2>&1 | Out-Null
    docker rm psitransfer-iahome 2>&1 | Out-Null
    Write-Success "Ancien conteneur supprime"
} else {
    Write-Success "Aucun conteneur existant"
}

# ============================================
# ETAPE 6 : Demarrage du conteneur PsiTransfer
# ============================================
Write-Step "6. Demarrage du conteneur PsiTransfer" "Cyan"

Push-Location (Split-Path $dockerComposePath)

Write-Info "Telechargement de l'image et demarrage du conteneur..."
docker-compose up -d 2>&1 | ForEach-Object {
    if ($_ -match "error" -or $_ -match "Error") {
        Write-Host "  $_" -ForegroundColor Red
    } else {
        Write-Host "  $_" -ForegroundColor Gray
    }
}

if ($LASTEXITCODE -eq 0) {
    Write-Success "Conteneur demarre"
} else {
    Write-Error "Echec du demarrage"
    Pop-Location
    pause
    exit 1
}

Pop-Location

# ============================================
# ETAPE 7 : Verification que le service repond
# ============================================
Write-Step "7. Verification que le service repond" "Cyan"

Write-Info "Attente du demarrage complet (30 secondes)..."
Start-Sleep -Seconds 10

$maxRetries = 10
$retryCount = 0
$isRunning = $false

while ($retryCount -lt $maxRetries -and -not $isRunning) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8087" -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
            $isRunning = $true
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
    Write-Host "  PSITRANSFER DEMARRE AVEC SUCCES !  " -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Application accessible sur:" -ForegroundColor Cyan
    Write-Host "  Local:    http://localhost:8087" -ForegroundColor White
    Write-Host "  Externe:  https://psitransfer.iahome.fr" -ForegroundColor White
    Write-Host ""
    
    # Afficher le statut du conteneur
    $containerStatus = docker ps --filter "name=psitransfer-iahome" --format "{{.Status}}" 2>&1
    if ($containerStatus -and $containerStatus -notmatch "error") {
        Write-Host "Statut du conteneur: $containerStatus" -ForegroundColor Gray
    }
} else {
    Write-Host "  DEMARRAGE EN COURS...                " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Le conteneur est en cours de demarrage." -ForegroundColor Yellow
    Write-Host "Cela peut prendre 30-60 secondes supplementaires." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Verifiez:" -ForegroundColor Cyan
    Write-Host "  1. Le statut du conteneur: docker ps | grep psitransfer" -ForegroundColor White
    Write-Host "  2. Les logs: docker logs psitransfer-iahome" -ForegroundColor White
    Write-Host "  3. L'URL: http://localhost:8087" -ForegroundColor White
}

Write-Host ""
Write-Host "Appuyez sur une touche pour continuer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")








