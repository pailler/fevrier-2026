# Script pour démarrer tous les services iahome.fr et sous-domaines en arrière-plan
# Fonctionne sans ouvrir de fenêtres PowerShell

param(
    [switch]$Stop,
    [switch]$Status,
    [switch]$InstallAutoStart
)

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

# Chemins pour les services consoles (déplacé en dehors de iahome)
$GameConsolePath = Join-Path $env:USERPROFILE "Documents\GameConsoleReservation-Web"
$BackendPath = Join-Path $GameConsolePath "backend"
$FrontendPath = $GameConsolePath
$FrontendPort = 5000
$BackendPort = 5001

# Arrêter tous les services
if ($Stop) {
    Write-Step "🛑 Arrêt de tous les services..." "Yellow"
    
    # Arrêter les services consoles
    Write-Info "Arrêt des services consoles..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    Get-Process -Name "python" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*http.server*5000*" -or $_.CommandLine -like "*http.server*8123*" } | Stop-Process -Force -ErrorAction SilentlyContinue
    
    Write-Success "Tous les services arrêtés"
    return
}

# Afficher le statut
if ($Status) {
    Write-Step "📊 Statut de tous les services" "Cyan"
    
    # Cloudflare Tunnel (méthode directe)
    Write-Host "`nCloudflare Tunnel :" -ForegroundColor Yellow
    $cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($cloudflaredProcess) {
        Write-Host "   Statut : ✅ En cours d'exécution" -ForegroundColor Green
        Write-Host "   PID : $($cloudflaredProcess.Id)" -ForegroundColor White
        Write-Host "   Démarrage : $($cloudflaredProcess.StartTime)" -ForegroundColor White
    } else {
        Write-Host "   ❌ Non démarré" -ForegroundColor Red
        Write-Host "   💡 Démarrez avec : .\scripts\start-cloudflare-simple.ps1" -ForegroundColor Gray
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

# Vérifier Cloudflare Tunnel (méthode directe qui fonctionne)
Write-Step "🔍 Vérification de Cloudflare Tunnel" "Cyan"
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Success "Cloudflare Tunnel : En cours d'exécution (PID: $($cloudflaredProcess.Id))"
} else {
    Write-Info "Démarrage de Cloudflare Tunnel (méthode directe)..."
    
    # Utiliser la méthode qui fonctionne : démarrage direct sans service Windows
    $configPath = Join-Path $RootPath "cloudflare-active-config.yml"
    $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
    
    if ($cloudflared -and (Test-Path $configPath)) {
        try {
            $configFullPath = (Resolve-Path $configPath).Path
            $process = Start-Process -FilePath $cloudflared.Source `
                -ArgumentList "tunnel", "--config", $configFullPath, "run" `
                -WorkingDirectory $RootPath `
                -WindowStyle Hidden `
                -PassThru `
                -ErrorAction Stop
            
            Start-Sleep -Seconds 3
            
            if (-not $process.HasExited) {
                $pidFile = Join-Path $RootPath "cloudflared.pid"
                $process.Id | Out-File -FilePath $pidFile -Encoding ASCII
                Write-Success "Cloudflare Tunnel : Démarré (PID: $($process.Id))"
            } else {
                Write-Host "⚠️  Cloudflare Tunnel n'a pas démarré correctement" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️  Erreur lors du démarrage de Cloudflare Tunnel: $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  cloudflared ou configuration non trouvés" -ForegroundColor Yellow
    }
}

# Démarrer l'application Next.js principale (iahome.fr)
Write-Step "🌐 Démarrage de l'application Next.js (iahome.fr)" "Green"

# Vérifier si l'application est déjà démarrée
$nextjsRunning = $false
try {
    $nextjsResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($nextjsResponse.StatusCode -eq 200) { $nextjsRunning = $true }
} catch {}

if (-not $nextjsRunning) {
    Write-Info "Démarrage de Next.js sur le port 3000..."
    
    # Vérifier si on est en mode production ou développement
    $packageJson = Join-Path $RootPath "package.json"
    if (Test-Path $packageJson) {
        Push-Location $RootPath
        
        # Essayer de démarrer en mode production d'abord
        $env:NODE_ENV = "production"
        $env:PORT = "3000"
        
        $nextjsScript = @"
cd '$RootPath'
`$env:NODE_ENV='production'
`$env:PORT='3000'
npm start
"@
        
        $nextjsProcess = Start-Process powershell -ArgumentList "-NoExit", "-WindowStyle", "Hidden", "-Command", $nextjsScript -PassThru -ErrorAction SilentlyContinue
        
        if ($nextjsProcess) {
            Write-Success "Next.js démarré (PID: $($nextjsProcess.Id))"
            Start-Sleep -Seconds 5
            
            # Vérifier que ça répond
            $maxRetries = 6
            $retryCount = 0
            while ($retryCount -lt $maxRetries) {
                try {
                    $testResponse = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 3 -UseBasicParsing -ErrorAction Stop
                    if ($testResponse.StatusCode -eq 200) {
                        Write-Success "Application Next.js accessible sur http://localhost:3000"
                        break
                    }
                } catch {
                    $retryCount++
                    if ($retryCount -lt $maxRetries) {
                        Start-Sleep -Seconds 5
                    }
                }
            }
        } else {
            Write-Host "⚠️  Impossible de démarrer Next.js" -ForegroundColor Yellow
            Write-Host "   Vérifiez que npm est installé et que les dépendances sont installées" -ForegroundColor Gray
        }
        
        Pop-Location
    } else {
        Write-Host "⚠️  package.json introuvable" -ForegroundColor Yellow
    }
} else {
    Write-Success "Application Next.js déjà démarrée"
}

# Démarrer Docker Desktop et tous les services
Write-Step "🐳 Démarrage de Docker Desktop et Services" "Cyan"
$dockerScript = Join-Path $ScriptPath "start-docker-and-services.ps1"
if (Test-Path $dockerScript) {
    Write-Info "Exécution du script de démarrage Docker..."
    & $dockerScript
    if ($LASTEXITCODE -ne 0) {
        Write-Host "⚠️  Erreur lors du démarrage des services Docker" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️  Script start-docker-and-services.ps1 non trouvé" -ForegroundColor Yellow
    Write-Host "   Tentative de démarrage manuel..." -ForegroundColor Gray
    
    # Fallback : démarrage manuel
    $dockerDesktop = Get-Process "Docker Desktop" -ErrorAction SilentlyContinue
    if (-not $dockerDesktop) {
        $dockerPaths = @(
            "${env:ProgramFiles}\Docker\Docker\Docker Desktop.exe",
            "${env:ProgramFiles(x86)}\Docker\Docker\Docker Desktop.exe"
        )
        foreach ($path in $dockerPaths) {
            if (Test-Path $path) {
                Start-Process -FilePath $path -WindowStyle Minimized
                Start-Sleep -Seconds 30
                break
            }
        }
    }
    
    # Démarrer les conteneurs
    $dockerComposePath = Join-Path $RootPath "docker-services\essentiels"
    if (Test-Path $dockerComposePath) {
        Push-Location $dockerComposePath
        docker-compose up -d 2>&1 | Out-Null
        Pop-Location
        Write-Success "Conteneurs Docker démarrés"
    }
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

# Démarrer Home Assistant
Write-Step "🏠 Démarrage de Home Assistant" "Green"

# Vérifier si Home Assistant est déjà démarré
$homeAssistantRunning = $false
try {
    $haResponse = Invoke-WebRequest -Uri "http://localhost:8123" -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($haResponse.StatusCode -eq 200) { $homeAssistantRunning = $true }
} catch {}

if (-not $homeAssistantRunning) {
    Write-Info "Démarrage de Home Assistant (port 8123)..."
    $haScript = Join-Path $ScriptPath "start-home-assistant-background.ps1"
    if (Test-Path $haScript) {
        & $haScript
        if ($LASTEXITCODE -eq 0) {
            Write-Success "Home Assistant démarré"
        } else {
            Write-Host "⚠️  Erreur lors du démarrage de Home Assistant" -ForegroundColor Yellow
        }
    } else {
        Write-Host "⚠️  Script Home Assistant non trouvé : $haScript" -ForegroundColor Yellow
    }
} else {
    Write-Success "Home Assistant déjà démarré"
}

# Résumé final
Write-Step "✅ Démarrage terminé !" "Green"
Write-Host "`n📋 Services démarrés :" -ForegroundColor Cyan
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "   ✅ Cloudflare Tunnel (méthode directe - PID: $($cloudflaredProcess.Id))" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Cloudflare Tunnel (non démarré)" -ForegroundColor Yellow
}
Write-Host "   ✅ Docker et conteneurs" -ForegroundColor Green
Write-Host "   ✅ Services consoles (backend + frontend)" -ForegroundColor Green
Write-Host "   ✅ Home Assistant (port 8123)" -ForegroundColor Green

Write-Host "`n💡 Commandes utiles :" -ForegroundColor Cyan
Write-Host "   - Statut : .\start-all-services.ps1 -Status" -ForegroundColor Gray
Write-Host "   - Arrêter : .\start-all-services.ps1 -Stop" -ForegroundColor Gray
Write-Host "   - Démarrage auto : .\start-all-services.ps1 -InstallAutoStart" -ForegroundColor Gray

