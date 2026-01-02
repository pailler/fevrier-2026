# Script PowerShell pour forcer le demarrage de Docker Desktop

Write-Host "Demarrage de Docker Desktop..." -ForegroundColor Cyan

# Chemins possibles de Docker Desktop
$dockerPaths = @(
    "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe",
    "$env:LOCALAPPDATA\Programs\Docker\Docker\Docker Desktop.exe",
    "${env:ProgramFiles}\Docker\Docker\resources\com.docker.driver.amd64\Docker Desktop.exe"
)

$dockerFound = $false

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
    
    # Recherche plus large
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

# Forcer le demarrage de Docker Desktop
Write-Host "Forçage du demarrage de Docker Desktop..." -ForegroundColor Cyan

# Verifier si Docker Desktop est deja en cours d'execution
$dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue

if ($dockerProcess) {
    Write-Host "Docker Desktop est deja en cours d'execution (PID: $($dockerProcess.Id -join ', '))" -ForegroundColor Yellow
    
    # Verifier si Docker daemon repond
    Write-Host "Verification du daemon Docker..." -ForegroundColor Yellow
    try {
        docker info 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "[OK] Docker daemon operationnel!" -ForegroundColor Green
            Write-Host "Docker Desktop est deja fonctionnel, pas besoin de redemarrer." -ForegroundColor Green
            exit 0
        } else {
            Write-Host "[ATTENTION] Docker Desktop est lance mais le daemon ne repond pas" -ForegroundColor Yellow
            Write-Host "Redemarrage de Docker Desktop..." -ForegroundColor Cyan
            
            # Arreter tous les processus Docker Desktop
            $dockerProcess | Stop-Process -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 3
        }
    } catch {
        Write-Host "[ATTENTION] Docker Desktop est lance mais le daemon ne repond pas" -ForegroundColor Yellow
        Write-Host "Redemarrage de Docker Desktop..." -ForegroundColor Cyan
        
        # Arreter tous les processus Docker Desktop
        $dockerProcess | Stop-Process -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
}

# Demarrer Docker Desktop
Write-Host "Demarrage de Docker Desktop..." -ForegroundColor Cyan

try {
    Start-Process -FilePath $dockerPath -ErrorAction Stop
    Write-Host "[OK] Commande de demarrage envoyee" -ForegroundColor Green
} catch {
    Write-Host "[ERREUR] Erreur lors du demarrage: $_" -ForegroundColor Red
    exit 1
}

# Attendre que Docker Desktop demarre
Write-Host "Attente du demarrage de Docker Desktop..." -ForegroundColor Yellow

$maxWait = 120 # 2 minutes maximum
$waitInterval = 2 # Vérifier toutes les 2 secondes
$elapsed = 0

while ($elapsed -lt $maxWait) {
    Start-Sleep -Seconds $waitInterval
    $elapsed += $waitInterval
    
    # Vérifier si le processus est en cours d'exécution
    $dockerProcess = Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue
    
    if ($dockerProcess) {
        # Vérifier si Docker daemon répond
        try {
            docker info 2>&1 | Out-Null
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[OK] Docker Desktop est operationnel!" -ForegroundColor Green
                Write-Host "   Temps d'attente: $elapsed s" -ForegroundColor Gray
                
                # Afficher les informations Docker
                Write-Host "`nInformations Docker:" -ForegroundColor Cyan
                docker version --format "   Version: {{.Server.Version}}" 2>&1 | Out-String | Write-Host
                
                exit 0
            }
        } catch {
            # Continuer à attendre
        }
    }
    
    # Afficher la progression
    if ($elapsed % 10 -eq 0) {
        Write-Host "   Attente... ($elapsed s / $maxWait s)" -ForegroundColor Gray
    }
}

Write-Host "Timeout: Docker Desktop n'a pas repondu dans les $maxWait secondes" -ForegroundColor Yellow
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
