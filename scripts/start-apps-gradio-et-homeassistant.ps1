# Demarre les services heberges sur l'hote : Home Assistant (8123) + apps Gradio (PhotoMaker, BiRefNet, Florence-2, Animagine XL)
# Usage : .\scripts\start-apps-gradio-et-homeassistant.ps1
# Depuis la racine du projet iahome.

$ErrorActionPreference = "Stop"
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot

# ========== CONFIGURATION : chemins des apps Gradio ==========
# Si vous avez les projets en local, definissez les chemins ci-dessous (ou creez scripts\apps-hosts.config.ps1).
# Sinon, laissez vide : le script demarrera uniquement Home Assistant.
$PhotomakerPath   = ""   # ex: "C:\Users\AAA\gradio-apps\photomaker"
$BirefnetPath     = ""   # ex: "C:\Users\AAA\gradio-apps\birefnet"
$Florence2Path    = ""   # ex: "C:\Users\AAA\gradio-apps\florence-2"
$AnimagineXLPath  = ""   # ex: "C:\Users\AAA\gradio-apps\animagine-xl"

# Python pour apps Forge (venv avec CUDA). Defini par apps-hosts.config.ps1 si present.
$ForgePythonExe = ""

# Charger une config externe si elle existe (chemins personnalises)
$ConfigFile = Join-Path $PSScriptRoot "apps-hosts.config.ps1"
if (Test-Path $ConfigFile) {
    . $ConfigFile
}

# Ports (doivent correspondre a Traefik / secure-proxy)
$PortHomeAssistant = 8123
$PortPhotomaker   = 7881
$PortBirefnet     = 7882
$PortFlorence2    = 7884
$PortAnimagineXL  = 7883   # port dedie (7881 = PhotoMaker)

function Test-PortInUse {
    param([int]$Port)
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return ($null -ne $conn)
    } catch {
        $out = netstat -ano 2>$null
        return ($out | Select-String -Pattern "LISTENING" | Select-String -Pattern ":$Port\s" -Quiet)
    }
}

function Start-GradioApp {
    param(
        [string]$Name,
        [string]$Path,
        [int]$Port
    )
    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path $Path)) {
        Write-Host "  [SKIP] $Name : chemin non configure ou introuvable." -ForegroundColor DarkGray
        return $null
    }
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : deja en cours (port $Port)." -ForegroundColor Green
        return $null
    }
    $appPy = Join-Path $Path "app.py"
    $forgeAppPy = Join-Path $Path "forge_app.py"
    if (Test-Path $forgeAppPy) {
        $scriptArg = "forge_app.py --port $Port --listen"
        $useGradioPort = $true
    } elseif (Test-Path $appPy) {
        $scriptArg = "app.py --port $Port"
        $useGradioPort = $false
    } else {
        Write-Host "  [SKIP] $Name : ni app.py ni forge_app.py dans $Path" -ForegroundColor DarkGray
        return $null
    }
    try {
        $pythonExe = "python"
        if ($Path -match "extensions-builtin" -and -not [string]::IsNullOrWhiteSpace($ForgePythonExe) -and (Test-Path $ForgePythonExe)) {
            $pythonExe = $ForgePythonExe
        }
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $pythonExe
        $psi.Arguments = $scriptArg
        $psi.WorkingDirectory = $Path
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $oldPyPath = $env:PYTHONPATH
        $oldGradioPort = $env:GRADIO_SERVER_PORT
        $oldGradioServerName = $env:GRADIO_SERVER_NAME
        if ($useGradioPort) {
            $env:GRADIO_SERVER_PORT = $Port
            $env:GRADIO_SERVER_NAME = "0.0.0.0"
            if ($Path -match "extensions-builtin") {
                $forgeRoot = (Split-Path (Split-Path $Path -Parent) -Parent)
                if (Test-Path (Join-Path $forgeRoot "spaces.py")) {
                    $modulesForge = Join-Path $forgeRoot "modules_forge"
                    $env:PYTHONPATH = "$forgeRoot;$modulesForge;$env:PYTHONPATH"
                }
            }
        }
        $p = [System.Diagnostics.Process]::Start($psi)
        $env:PYTHONPATH = $oldPyPath
        $env:GRADIO_SERVER_PORT = $oldGradioPort
        if ($null -ne $oldGradioServerName) { $env:GRADIO_SERVER_NAME = $oldGradioServerName } else { Remove-Item Env:GRADIO_SERVER_NAME -ErrorAction SilentlyContinue }
        Write-Host "  [OK]   $Name demarre (port $Port, PID $($p.Id))." -ForegroundColor Green
        return $p
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

function Start-HomeAssistant {
    $codesHa = Join-Path $ProjectRoot "essentiels\codes-ha"
    if (-not (Test-Path $codesHa)) {
        Write-Host "  [SKIP] Home Assistant : dossier essentiels\codes-ha introuvable." -ForegroundColor DarkGray
        return $null
    }
    if (Test-PortInUse -Port $PortHomeAssistant) {
        Write-Host "  [OK]   Home Assistant : deja en cours (port $PortHomeAssistant)." -ForegroundColor Green
        return $null
    }
    $pidFile = Join-Path $ProjectRoot "homeassistant.pid"
    $logFile = Join-Path $ProjectRoot "homeassistant-startup.log"
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "python"
        $psi.Arguments = "-m http.server $PortHomeAssistant"
        $psi.WorkingDirectory = $codesHa
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $p = [System.Diagnostics.Process]::Start($psi)
        $p.Id | Out-File -FilePath $pidFile -Encoding utf8
        "$(Get-Date -Format 'o') - Home Assistant (http.server) demarre PID $($p.Id)" | Out-File -FilePath $logFile -Append -Encoding utf8
        Write-Host "  [OK]   Home Assistant demarre (port $PortHomeAssistant, PID $($p.Id))." -ForegroundColor Green
        return $p
    } catch {
        Write-Host "  [ERREUR] Home Assistant : $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# ---------- Execution ----------
Write-Host "`n=== Demarrage des services (hote) ===" -ForegroundColor Cyan
Write-Host "   Projet : $ProjectRoot`n" -ForegroundColor Gray

Write-Host "1. Home Assistant (homeassistant.iahome.fr -> :$PortHomeAssistant)..." -ForegroundColor Yellow
Start-HomeAssistant | Out-Null

Write-Host "2. PhotoMaker (photomaker.iahome.fr -> :$PortPhotomaker)..." -ForegroundColor Yellow
Start-GradioApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker | Out-Null

Write-Host "3. BiRefNet (birefnet.iahome.fr -> :$PortBirefnet)..." -ForegroundColor Yellow
Start-GradioApp -Name "BiRefNet" -Path $BirefnetPath -Port $PortBirefnet | Out-Null

Write-Host "4. Florence-2 (florence2.iahome.fr -> :$PortFlorence2)..." -ForegroundColor Yellow
Start-GradioApp -Name "Florence-2" -Path $Florence2Path -Port $PortFlorence2 | Out-Null

Write-Host "5. Animagine XL (animaginexl.iahome.fr -> :$PortAnimagineXL)..." -ForegroundColor Yellow
Start-GradioApp -Name "Animagine XL" -Path $AnimagineXLPath -Port $PortAnimagineXL | Out-Null

Write-Host "`n=== Termine ===" -ForegroundColor Cyan
Write-Host "   Home Assistant : http://localhost:$PortHomeAssistant" -ForegroundColor White
Write-Host "   Pour les apps Gradio : definissez les chemins en haut du script ou dans scripts\apps-hosts.config.ps1" -ForegroundColor Gray
Write-Host ""
