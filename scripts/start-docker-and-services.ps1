# Script pour demarrer Docker Desktop et tous les services des sous-domaines
# Automatise le demarrage complet de tous les services IAHome

param(
    [switch]$Status,
    [switch]$Stop
)

$ErrorActionPreference = "Continue"
$ScriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
$RootPath = Split-Path -Parent $ScriptPath

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Cyan
}

function Write-Warning {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Arreter tous les services
if ($Stop) {
    Write-Step "Arret de tous les services Docker..." "Yellow"
    
    $dockerComposePath = Join-Path $RootPath "docker-services\essentiels"
    if (Test-Path $dockerComposePath) {
        Push-Location $dockerComposePath
        docker-compose down 2>&1 | Out-Null
        Pop-Location
    }
    
    Write-Success "Tous les services Docker arretes"
    return
}

# Afficher le statut
if ($Status) {
    Write-Step "Statut des services Docker" "Cyan"
    
    # Docker Desktop
    $dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if ($dockerDesktop) {
        Write-Success "Docker Desktop : En cours d'execution (PID: $($dockerDesktop.Id))"
    } else {
        Write-Error "Docker Desktop : Non demarre"
    }
    
    # Verifier Docker daemon
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Docker Daemon : Accessible"
        } else {
            Write-Error "Docker Daemon : Non accessible"
        }
    } catch {
        Write-Error "Docker Daemon : Non accessible"
    }
    
    # Conteneurs
    Write-Host "`nConteneurs Docker :" -ForegroundColor Yellow
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host $containers -ForegroundColor White
        } else {
            Write-Warning "Impossible de lister les conteneurs"
        }
    } catch {
        Write-Warning "Erreur lors de la verification des conteneurs"
    }
    
    # Verifier les ports des services
    Write-Host "`nPorts des services :" -ForegroundColor Yellow
    $services = @(
        @{Name="QR Codes"; Port=7006; Hostname="qrcodes.iahome.fr"},
        @{Name="LibreSpeed"; Port=8085; Hostname="librespeed.iahome.fr"},
        @{Name="MeTube"; Port=8081; Hostname="metube.iahome.fr"},
        @{Name="PsiTransfer"; Port=8087; Hostname="psitransfer.iahome.fr"},
        @{Name="PDF"; Port=8086; Hostname="pdf.iahome.fr"},
        @{Name="Whisper"; Port=8093; Hostname="whisper.iahome.fr"},
        @{Name="Meeting Reports"; Port=3050; Hostname="meeting-reports.iahome.fr"},
        @{Name="Hunyuan3D"; Port=8888; Hostname="hunyuan3d.iahome.fr"}
    )
    
    foreach ($service in $services) {
        $listening = netstat -ano | Select-String ":$($service.Port)" | Select-String "LISTENING"
        if ($listening) {
            Write-Success "$($service.Name) (port $($service.Port)) : Port en ecoute"
        } else {
            Write-Error "$($service.Name) (port $($service.Port)) : Non accessible"
        }
    }
    
    return
}

Write-Host "`n============================================================" -ForegroundColor Cyan
Write-Host "  Demarrage Docker Desktop et Services IAHome" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Etape 1 : Demarrer Docker Desktop
Write-Step "Etape 1 : Demarrage de Docker Desktop" "Cyan"

$dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerDesktop) {
    Write-Success "Docker Desktop est deja en cours d'execution (PID: $($dockerDesktop.Id))"
} else {
    Write-Info "Demarrage de Docker Desktop..."
    
    # Chemins possibles pour Docker Desktop
    $dockerPaths = @(
        "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
        "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
        "$env:LOCALAPPDATA\Docker\Docker Desktop.exe"
    )
    
    $dockerFound = $false
    foreach ($path in $dockerPaths) {
        if (Test-Path $path) {
            Write-Info "Lancement de Docker Desktop depuis : $path"
            Start-Process -FilePath $path -WindowStyle Minimized
            $dockerFound = $true
            break
        }
    }
    
    if (-not $dockerFound) {
        Write-Error "Docker Desktop n'a pas ete trouve dans les emplacements standards"
        Write-Info "Veuillez demarrer Docker Desktop manuellement"
        return
    }
    
    # Attendre que Docker Desktop demarre
    Write-Info "Attente du demarrage de Docker Desktop (peut prendre 30-60 secondes)..."
    $maxWait = 120 # 2 minutes maximum
    $waited = 0
    $dockerReady = $false
    
    while ($waited -lt $maxWait) {
        Start-Sleep -Seconds 5
        $waited += 5
        
        try {
            docker info 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                $dockerReady = $true
                break
            }
        } catch {
            # Continue d'attendre
        }
        
        if ($waited % 15 -eq 0) {
            Write-Info "En attente... ($waited secondes)"
        }
    }
    
    if ($dockerReady) {
        Write-Success "Docker Desktop est pret !"
    } else {
        Write-Error "Docker Desktop n'a pas demarre dans les delais"
        Write-Info "Veuillez verifier manuellement et relancer le script"
        return
    }
}

# Etape 2 : Creer les reseaux Docker si necessaire
Write-Step "Etape 2 : Verification des reseaux Docker" "Cyan"

$networks = @("iahome-network", "iahome_iahome-network")
foreach ($network in $networks) {
    $exists = docker network ls --format "{{.Name}}" | Select-String "^$network$"
    if (-not $exists) {
        Write-Info "Creation du reseau : $network"
        docker network create $network 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Reseau $network cree"
        } else {
            Write-Warning "Impossible de creer le reseau $network (peut deja exister)"
        }
    } else {
        Write-Success "Reseau $network existe deja"
    }
}

# Etape 3 : Demarrer les services Docker
Write-Step "Etape 3 : Demarrage des services Docker" "Green"

$dockerComposePath = Join-Path $RootPath "docker-services\essentiels"
if (-not (Test-Path $dockerComposePath)) {
    Write-Error "Repertoire docker-services\essentiels non trouve : $dockerComposePath"
    return
}

Push-Location $dockerComposePath

# Demarrer tous les services
Write-Info "Demarrage de tous les services via docker-compose..."
docker-compose up -d 2>&1 | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Success "Services Docker demarres"
} else {
    Write-Warning "Certains services peuvent ne pas avoir demarre correctement"
}

# Attendre que les services demarrent
Write-Info "Attente du demarrage des services (10 secondes)..."
Start-Sleep -Seconds 10

# Verifier le statut des conteneurs
Write-Info "Verification du statut des conteneurs..."
$containers = docker ps --format "{{.Names}}\t{{.Status}}" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "`nConteneurs en cours d'execution :" -ForegroundColor Cyan
    Write-Host $containers -ForegroundColor White
} else {
    Write-Warning "Impossible de verifier le statut des conteneurs"
}

Pop-Location

# Etape 4 : Verifier les services individuels
Write-Step "Etape 4 : Verification des services" "Cyan"

$services = @(
    @{Name="QR Codes"; Port=7006; Path="/health"},
    @{Name="LibreSpeed"; Port=8085; Path="/"},
    @{Name="MeTube"; Port=8081; Path="/"},
    @{Name="PsiTransfer"; Port=8087; Path="/"},
    @{Name="PDF"; Port=8086; Path="/"},
    @{Name="Whisper"; Port=8093; Path="/"},
    @{Name="Meeting Reports"; Port=3050; Path="/health"},
    @{Name="Hunyuan3D"; Port=8888; Path="/"}
)

$successCount = 0
$totalCount = $services.Count

foreach ($service in $services) {
    try {
        $url = "http://localhost:$($service.Port)$($service.Path)"
        $response = Invoke-WebRequest -Uri $url -TimeoutSec 3 -ErrorAction SilentlyContinue -UseBasicParsing
        if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
            Write-Success "$($service.Name) (port $($service.Port)) : Operationnel"
            $successCount++
        } else {
            Write-Warning "$($service.Name) (port $($service.Port)) : Reponse $($response.StatusCode)"
        }
    } catch {
        # Verifier si le port est au moins en ecoute
        $listening = netstat -ano | Select-String ":$($service.Port)" | Select-String "LISTENING"
        if ($listening) {
            Write-Success "$($service.Name) (port $($service.Port)) : Port en ecoute"
            $successCount++
        } else {
            Write-Error "$($service.Name) (port $($service.Port)) : Non accessible"
        }
    }
}

# Resume final
Write-Step "Demarrage termine !" "Green"
Write-Host "`nResume :" -ForegroundColor Cyan
Write-Host "   Services operationnels : $successCount / $totalCount" -ForegroundColor $(if ($successCount -eq $totalCount) {'Green'} else {'Yellow'})
Write-Host "   Docker Desktop : Demarre" -ForegroundColor Green
Write-Host "   Services Docker : Demarres" -ForegroundColor Green

Write-Host "`nCommandes utiles :" -ForegroundColor Cyan
Write-Host "   - Statut : .\scripts\start-docker-and-services.ps1 -Status" -ForegroundColor Gray
Write-Host "   - Arreter : .\scripts\start-docker-and-services.ps1 -Stop" -ForegroundColor Gray
Write-Host "   - Logs : docker logs <nom-conteneur>" -ForegroundColor Gray
