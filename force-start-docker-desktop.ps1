# Script PowerShell pour FORCER le demarrage de Docker Desktop
# Arrete Docker Desktop s'il est deja en cours et le redemarre

Write-Host "=== FORCAGE DU DEMARRAGE DE DOCKER DESKTOP ===" -ForegroundColor Cyan

# Chemins possibles de Docker Desktop
$dockerPaths = @(
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
    "$env:LOCALAPPDATA\Programs\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles}\Docker\Docker\resources\com.docker.driver.amd64\Docker Desktop.exe"
)

$dockerFound = $false
$dockerPath = $null

# Chercher Docker Desktop
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        Write-Host "[OK] Docker Desktop trouve: $path" -ForegroundColor Green
        $dockerPath = $path
        $dockerFound = $true
        break
    }
}

if (-not $dockerFound) {
    Write-Host "[ERREUR] Docker Desktop non trouve dans les emplacements standards" -ForegroundColor Red
    Write-Host "Recherche dans tout le systeme..." -ForegroundColor Yellow
    
    $searchPaths = @(
        "${env:ProgramFiles}\Docker",
        "${env:ProgramFiles(x86)}\Docker",
        "$env:LOCALAPPDATA\Programs\Docker"
    )
    
    foreach ($searchPath in $searchPaths) {
        if (Test-Path $searchPath) {
            $found = Get-ChildItem -Path $searchPath -Recurse -Filter "Docker Desktop.exe" -ErrorAction SilentlyContinue | Select-Object -First 1
            if ($found) {
                $dockerPath = $found.FullName
                $dockerFound = $true
                Write-Host "[OK] Docker Desktop trouve: $dockerPath" -ForegroundColor Green
                break
            }
        }
    }
}

if (-not $dockerFound) {
    Write-Host "[ERREUR] Impossible de trouver Docker Desktop" -ForegroundColor Red
    Write-Host "Veuillez installer Docker Desktop depuis: https://www.docker.com/products/docker-desktop" -ForegroundColor Yellow
    exit 1
}

# ETAPE 1: Arreter Docker Desktop s'il est en cours d'execution
Write-Host "`n[ETAPE 1] Verification des processus Docker Desktop..." -ForegroundColor Cyan

$dockerProcesses = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerProcesses) {
    Write-Host "Docker Desktop est en cours d'execution (PID: $($dockerProcesses.Id -join ', '))" -ForegroundColor Yellow
    Write-Host "Arret force de Docker Desktop..." -ForegroundColor Yellow
    
    # Arreter tous les processus Docker Desktop
    $dockerProcesses | ForEach-Object {
        Write-Host "  Arret du processus PID: $($_.Id)" -ForegroundColor Gray
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    
    Write-Host "Attente de l'arret complet (5 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 5
    
    # Verifier que les processus sont bien arretes
    $remainingProcesses = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    if ($remainingProcesses) {
        Write-Host "Arret force des processus restants..." -ForegroundColor Yellow
        $remainingProcesses | ForEach-Object {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 3
    }
    
    Write-Host "[OK] Docker Desktop arrete" -ForegroundColor Green
} else {
    Write-Host "[OK] Docker Desktop n'est pas en cours d'execution" -ForegroundColor Green
}

# ETAPE 2: Demarrer Docker Desktop
Write-Host "`n[ETAPE 2] Demarrage de Docker Desktop..." -ForegroundColor Cyan

try {
    Write-Host "Lancement de: $dockerPath" -ForegroundColor Gray
    Start-Process -FilePath $dockerPath -ErrorAction Stop
    Write-Host "[OK] Commande de demarrage envoyee" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Erreur lors du demarrage: $_" -ForegroundColor Red
    exit 1
}

# ETAPE 3: Attendre que Docker Desktop demarre
Write-Host "`n[ETAPE 3] Attente du demarrage de Docker Desktop..." -ForegroundColor Cyan

$maxWait = 120 # 2 minutes maximum
$waitInterval = 2 # Verifier toutes les 2 secondes
$elapsed = 0

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $waitInterval
    $elapsed += $waitInterval
    
    # Verifier si le processus est en cours d'execution
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    
    if ($dockerProcess) {
        # Verifier si Docker daemon repond
        try {
            docker info 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "`n[SUCCES] Docker Desktop est operationnel!" -ForegroundColor Green
                Write-Host "   Temps d'attente: $elapsed s" -ForegroundColor Gray
                
                # Afficher les informations Docker
                Write-Host "`nInformations Docker:" -ForegroundColor Cyan
                docker version --format "   Version: {{.Server.Version}}" 2>&1 | Out-String | Write-Host
                
                exit 0
            }
        } catch {
            # Continuer a attendre
        }
    }
    
    # Afficher la progression
    if ($elapsed % 10 -eq 0) {
        Write-Host "   Attente... ($elapsed s / $maxWait s)" -ForegroundColor Gray
    }
}

Write-Host "`n[ATTENTION] Timeout: Docker Desktop n'a pas repondu dans les $maxWait secondes" -ForegroundColor Yellow
Write-Host "Docker Desktop peut prendre plus de temps au premier demarrage" -ForegroundColor Yellow
Write-Host "Verifiez manuellement que Docker Desktop est bien lance" -ForegroundColor Yellow

# Verification finale
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
if ($dockerProcess) {
    Write-Host "[OK] Processus Docker Desktop detecte (mais daemon non verifie)" -ForegroundColor Yellow
} else {
    Write-Host "[ERREUR] Processus Docker Desktop non detecte" -ForegroundColor Red
}

exit 1
