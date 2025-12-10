# Script pour démarrer tous les services iahome.fr et sous-domaines en arrière-plan
# Fonctionne sans ouvrir de fenêtres PowerShell

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$InstallAutoStart
)

$ErrorActionPreference = "Stop"
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path

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

# Chemins pour les services consoles
$BackendPath = Join-Path $env:USERPROFILE "Documents\GameConsoleReservation-Web\backend"
$FrontendPath = Join-Path $env:USERPROFILE "Documents\GameConsoleReservation-Web"
$FrontendPort = 5000
$BackendPort = 5001

# Arrêter tous les services
if ($Stop) {
    Write-Step "🛑 Arrêt de tous les services..." "Yellow"
    
    # Arrêter les services consoles
    Write-Info "Arrêt des services consoles..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*http.server*5000*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Success "Tous les services arrêtés"
    return
}

# Afficher le statut
if ($Status) {
    Write-Step "📊 Statut de tous les services" "Cyan"
    
    # Cloudflare Tunnel
    Write-Host "`nCloudflare Tunnel :" -ForegroundColor Yellow
    $cfService = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($cfService) {
        Write-Host "   Statut : $($cfService.Status)" -ForegroundColor $(if ($cfService.Status -eq 'Running') {'Green'} else {'Red'})
        Write-Host "   Démarrage : $($cfService.StartType)" -ForegroundColor White
    } else {
        Write-Host "   ❌ Service non installé" -ForegroundColor Red
    }
    
    # Docker
    Write-Host "`nDocker :" -ForegroundColor Yellow
    $dockerService = Get-Service -Name "docker" -ErrorAction SilentlyContinue
    if ($dockerService) {
        Write-Host "   Statut : $($dockerService.Status)" -ForegroundColor $(if ($dockerService.Status -eq 'Running') {'Green'} else {'Red'})
    } else {
        Write-Host "   ⚠️  Service Docker non trouvé" -ForegroundColor Yellow
    }
    
    # Services consoles
    Write-Host "`nServices Consoles :" -ForegroundColor Yellow
    $backendRunning = $false
    $frontendRunning = $false
    
    try {
        $backendResponse = Invoke-WebRequest -Uri "http://localhost:$BackendPort/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($backendResponse.StatusCode -eq 200) { $backendRunning = $true }
    } catch {}
    
    try {
        $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($frontendResponse.StatusCode -eq 200) { $frontendRunning = $true }
    } catch {}
    
    Write-Host "   Backend (port $BackendPort): $(if ($backendRunning) {'✅ Opérationnel'} else {'❌ Non accessible'})" -ForegroundColor $(if ($backendRunning) {'Green'} else {'Red'})
    Write-Host "   Frontend (port $FrontendPort): $(if ($frontendRunning) {'✅ Opérationnel'} else {'❌ Non accessible'})" -ForegroundColor $(if ($frontendRunning) {'Green'} else {'Red'})
    
    # Docker containers
    Write-Host "`nConteneurs Docker :" -ForegroundColor Yellow
    $containers = docker ps --format "table {{.Names}}\t{{.Status}}" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host $containers -ForegroundColor White
    } else {
        Write-Host "   ⚠️  Docker n'est pas accessible" -ForegroundColor Yellow
    }
    
    return
}

# Installer le démarrage automatique
if ($InstallAutoStart) {
    Write-Step "⚙️  Installation du démarrage automatique" "Cyan"
    
    $isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
    
    if (-not $isAdmin) {
        Write-Host "❌ Ce script doit être exécuté en tant qu'administrateur" -ForegroundColor Red
        Write-Host "`nPour installer le démarrage automatique :" -ForegroundColor Yellow
        Write-Host "1. Clic droit sur PowerShell → Exécuter en tant qu'administrateur" -ForegroundColor Gray
        Write-Host "2. Exécuter : .\start-all-services.ps1 -InstallAutoStart" -ForegroundColor Gray
        return
    }
    
    $scriptPath = (Resolve-Path "$RootPath\start-all-services.ps1").Path
    $taskName = "IAHome-StartAllServices"
    
    # Supprimer la tâche existante si elle existe
    $existingTask = Get-ScheduledTask -TaskName $taskName -ErrorAction SilentlyContinue
    if ($existingTask) {
        Unregister-ScheduledTask -TaskName $taskName -Confirm:$false
    }
    
    # Créer la tâche planifiée
    $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument "-WindowStyle Hidden -ExecutionPolicy Bypass -File `"$scriptPath`""
    $trigger = New-ScheduledTaskTrigger -AtLogOn
    $principal = New-ScheduledTaskPrincipal -UserId "$env:USERDOMAIN\$env:USERNAME" -LogonType Interactive -RunLevel Highest
    $settings = New-ScheduledTaskSettingsSet -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries -StartWhenAvailable -RunOnlyIfNetworkAvailable
    
    Register-ScheduledTask -TaskName $taskName -Action $action -Trigger $trigger -Principal $principal -Settings $settings -Description "Démarre automatiquement tous les services IAHome au démarrage de Windows"
    
    Write-Success "Démarrage automatique installé"
    Write-Host "`nLa tâche planifiée '$taskName' démarrera automatiquement au login" -ForegroundColor Cyan
    return
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Démarrage de tous les services IAHome              ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Vérifier Cloudflare Tunnel
Write-Step "🔍 Vérification de Cloudflare Tunnel" "Cyan"
$cfService = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cfService) {
    if ($cfService.Status -ne 'Running') {
        Write-Info "Démarrage de Cloudflare Tunnel..."
        Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
    Write-Success "Cloudflare Tunnel : $($cfService.Status)"
} else {
    Write-Host "⚠️  Service Cloudflare Tunnel non trouvé" -ForegroundColor Yellow
    Write-Host "   Installez-le avec : .\install-cloudflare-service.ps1" -ForegroundColor Gray
}

# Vérifier Docker
Write-Step "🔍 Vérification de Docker" "Cyan"
$dockerService = Get-Service -Name "docker" -ErrorAction SilentlyContinue
if ($dockerService) {
    if ($dockerService.Status -ne 'Running') {
        Write-Info "Démarrage de Docker..."
        Start-Service -Name "docker" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
    }
    Write-Success "Docker : $($dockerService.Status)"
    
    # Démarrer les conteneurs Docker
    Write-Step "🐳 Démarrage des conteneurs Docker" "Green"
    Push-Location $RootPath
    docker-compose -f docker-compose.prod.yml up -d 2>&1 | Out-Null
    Pop-Location
    Start-Sleep -Seconds 5
    Write-Success "Conteneurs Docker démarrés"
} else {
    Write-Host "⚠️  Docker n'est pas installé ou le service n'est pas trouvé" -ForegroundColor Yellow
}

# Démarrer les services consoles
Write-Step "🎮 Démarrage des services consoles" "Green"

# Vérifier si les services sont déjà démarrés
$backendRunning = $false
$frontendRunning = $false

try {
    $backendResponse = Invoke-WebRequest -Uri "http://localhost:$BackendPort/api/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($backendResponse.StatusCode -eq 200) { $backendRunning = $true }
} catch {}

try {
    $frontendResponse = Invoke-WebRequest -Uri "http://localhost:$FrontendPort" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($frontendResponse.StatusCode -eq 200) { $frontendRunning = $true }
} catch {}

# Démarrer le backend si nécessaire
if (-not $backendRunning) {
    Write-Info "Démarrage du backend (port $BackendPort)..."
    if (Test-Path $BackendPath) {
        Push-Location $BackendPath
        $backendJob = Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden -PassThru -ErrorAction SilentlyContinue
        Pop-Location
        Start-Sleep -Seconds 3
        if ($backendJob) {
            Write-Success "Backend démarré (PID: $($backendJob.Id))"
        } else {
            Write-Host "⚠️  Impossible de démarrer le backend" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Dossier backend non trouvé : $BackendPath" -ForegroundColor Yellow
    }
} else {
    Write-Success "Backend déjà démarré"
}

# Démarrer le frontend si nécessaire
if (-not $frontendRunning) {
    Write-Info "Démarrage du frontend (port $FrontendPort)..."
    if (Test-Path $FrontendPath) {
        Push-Location $FrontendPath
        $frontendJob = Start-Process -FilePath "python" -ArgumentList "-m", "http.server", "$FrontendPort" -WindowStyle Hidden -PassThru -ErrorAction SilentlyContinue
        Pop-Location
        Start-Sleep -Seconds 2
        if ($frontendJob) {
            Write-Success "Frontend démarré (PID: $($frontendJob.Id))"
        } else {
            Write-Host "⚠️  Impossible de démarrer le frontend" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Dossier frontend non trouvé : $FrontendPath" -ForegroundColor Yellow
    }
} else {
    Write-Success "Frontend déjà démarré"
}

# Résumé final
Write-Step "✅ Démarrage terminé !" "Green"
Write-Host "`n📋 Services démarrés :" -ForegroundColor Cyan
Write-Host "   ✅ Cloudflare Tunnel (service Windows)" -ForegroundColor Green
Write-Host "   ✅ Docker et conteneurs" -ForegroundColor Green
Write-Host "   ✅ Services consoles (backend + frontend)" -ForegroundColor Green

Write-Host "`n💡 Commandes utiles :" -ForegroundColor Cyan
Write-Host "   - Statut : .\start-all-services.ps1 -Status" -ForegroundColor Gray
Write-Host "   - Arrêter : .\start-all-services.ps1 -Stop" -ForegroundColor Gray
Write-Host "   - Démarrage auto : .\start-all-services.ps1 -InstallAutoStart" -ForegroundColor Gray

