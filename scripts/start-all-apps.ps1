# =============================================================================
# Demarre le maximum d'applications iahome en parallele
# Usage : .\scripts\start-all-apps.ps1
# Depuis la racine du projet iahome.
# =============================================================================

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot

# Parametre optionnel : -SkipGradioApps pour ignorer PhotoMaker/BiRefNet/Florence-2/Animagine XL
# Utile si erreur torchvision _C.pyd (incompatibilite PyTorch/torchvision)
param([switch]$SkipGradioApps)
$CmdLineSkipGradio = $SkipGradioApps.IsPresent

# Charger la config des apps Gradio si elle existe
$ConfigFile = Join-Path $PSScriptRoot "apps-hosts.config.ps1"
if (Test-Path $ConfigFile) {
    . $ConfigFile
}

# SkipGradioApps : -SkipGradioApps en ligne de commande OU $SkipGradioApps dans config
$script:SkipGradioApps = $CmdLineSkipGradio -or ($null -ne (Get-Variable -Name "SkipGradioApps" -Scope 0 -ErrorAction SilentlyContinue) -and [bool]$SkipGradioApps)

# Cache Hugging Face pour BiRefNet, Animagine XL, Florence-2 - evite les telechargements repetes
$DefaultModelsCache = Join-Path $ProjectRoot "models-cache"
if (-not $ModelsCachePath) { $ModelsCachePath = $DefaultModelsCache }
if (-not (Test-Path $ModelsCachePath)) { New-Item -ItemType Directory -Path $ModelsCachePath -Force | Out-Null }
$env:HF_HOME = $ModelsCachePath
$env:HF_HUB_CACHE = Join-Path $ModelsCachePath "hub"
$env:TRANSFORMERS_CACHE = Join-Path $ModelsCachePath "transformers"

# Chemins par defaut pour les apps Gradio (surchargeables via apps-hosts.config.ps1)
if (-not $PhotomakerPath)   { $PhotomakerPath   = Join-Path $ProjectRoot "gradio-apps\photomaker" }
if (-not $BirefnetPath)     { $BirefnetPath     = Join-Path $ProjectRoot "gradio-apps\birefnet" }
if (-not $Florence2Path)    { $Florence2Path    = Join-Path $ProjectRoot "gradio-apps\florence-2" }
if (-not $AnimagineXLPath)  { $AnimagineXLPath  = Join-Path $ProjectRoot "gradio-apps\animagine-xl" }

# Ports standard
$PortIahome         = 3000
$PortPromptGen     = 3002
$PortMeetingReports= 3050
$PortPhotomaker    = 7881
$PortBirefnet      = 7882
$PortAnimagineXL   = 7883
$PortFlorence2     = 7884
$PortPhotobooth    = 7885
$PortHomeAssistant = 8123
$PortVoiceIsolation= 8100

# Dossiers des apps
$PathPromptGen      = Join-Path $ProjectRoot "prompt-generator"
$PathApprendre      = Join-Path $ProjectRoot "apprendre-autrement"
$PathPhotobooth     = Join-Path $ProjectRoot "photobooth"
$PathCodesHa        = Join-Path $ProjectRoot "essentiels\codes-ha"

# Chemins Docker Compose (relatifs a iahome)
$ParentDir            = Split-Path $ProjectRoot -Parent
$DockerMeetingReports = Join-Path $ProjectRoot "meeting-reports"
$DockerPdf            = Join-Path $ProjectRoot "docker-services\essentiels\pdf"
$DockerLibrespeed     = if (Test-Path (Join-Path $ProjectRoot "docker-services\essentiels\librespeed")) { Join-Path $ProjectRoot "docker-services\essentiels\librespeed" } else { Join-Path $ProjectRoot "essentiels\librespeed" }
$DockerMetube         = Join-Path $ProjectRoot "docker-services\essentiels\metube"
$DockerVoiceIsolation = Join-Path $ParentDir "voice-isolation-service"
$DockerWhisper        = Join-Path $ParentDir "whisper-service"
$DockerPsitransfer    = Join-Path $ProjectRoot "essentiels\psitransfer"
$DockerQrcodes        = Join-Path $ProjectRoot "docker-services\essentiels\qrcodes"

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

function Start-NpmDev {
    param([string]$Name, [string]$Path, [int]$Port, [string]$Script = "dev")
    if (-not (Test-Path $Path)) {
        Write-Host "  [SKIP] $Name : dossier introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : deja en cours (port $Port)." -ForegroundColor Green
        return
    }
    $pkg = Join-Path $Path "package.json"
    if (-not (Test-Path $pkg)) {
        Write-Host "  [SKIP] $Name : package.json introuvable." -ForegroundColor DarkGray
        return
    }
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "npm"
        $psi.Arguments = "run $Script"
        $psi.WorkingDirectory = $Path
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $p = [System.Diagnostics.Process]::Start($psi)
        Write-Host "  [OK]   $Name demarre (port $Port, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-GradioApp {
    param([string]$Name, [string]$Path, [int]$Port)
    if ($script:SkipGradioApps) {
        Write-Host "  [SKIP] $Name : apps Gradio desactivees (erreur torchvision ?)." -ForegroundColor DarkGray
        return
    }
    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path $Path)) {
        Write-Host "  [SKIP] $Name : chemin non configure ou introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : deja en cours (port $Port)." -ForegroundColor Green
        return
    }
    $appPy = Join-Path $Path "app.py"
    $forgeAppPy = Join-Path $Path "forge_app.py"
    $scriptArg = ""
    if (Test-Path $forgeAppPy) {
        $scriptArg = "forge_app.py --port $Port --listen"
    } elseif (Test-Path $appPy) {
        $scriptArg = "app.py --port $Port"
    } else {
        Write-Host "  [SKIP] $Name : ni app.py ni forge_app.py." -ForegroundColor DarkGray
        return
    }
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "python"
        $psi.Arguments = $scriptArg
        $psi.WorkingDirectory = $Path
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $p = [System.Diagnostics.Process]::Start($psi)
        Write-Host "  [OK]   $Name demarre (port $Port, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-HomeAssistant {
    if (-not (Test-Path $PathCodesHa)) {
        Write-Host "  [SKIP] Home Assistant : essentiels\codes-ha introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $PortHomeAssistant) {
        Write-Host "  [OK]   Home Assistant : deja en cours (port $PortHomeAssistant)." -ForegroundColor Green
        return
    }
    try {
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = "python"
        $psi.Arguments = "-m http.server $PortHomeAssistant"
        $psi.WorkingDirectory = $PathCodesHa
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $p = [System.Diagnostics.Process]::Start($psi)
        Write-Host "  [OK]   Home Assistant demarre (port $PortHomeAssistant, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] Home Assistant : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-DockerCompose {
    param([string]$Name, [string]$Path)
    if (-not (Test-Path $Path)) {
        Write-Host "  [SKIP] $Name : dossier introuvable." -ForegroundColor DarkGray
        return
    }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "  [SKIP] $Name : Docker non installe ou indisponible." -ForegroundColor DarkGray
        return
    }
    $composeFile = Join-Path $Path "docker-compose.yml"
    if (-not (Test-Path $composeFile)) {
        Write-Host "  [SKIP] $Name : docker-compose.yml introuvable." -ForegroundColor DarkGray
        return
    }
    try {
        Push-Location $Path
        docker compose up -d 2>&1 | Out-Null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK]   $Name demarre (Docker)." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $Name : erreur docker compose." -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Creer le reseau Docker iahome-network si necessaire pour les services
function Ensure-DockerNetwork {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        $net = docker network ls -q -f "name=iahome-network" 2>$null
        if (-not $net) {
            docker network create iahome-network 2>$null
            Write-Host "  [OK]   Reseau Docker iahome-network cree." -ForegroundColor Green
        }
        $whisperNet = docker network ls -q -f "name=whisper-network" 2>$null
        if (-not $whisperNet) {
            docker network create whisper-network 2>$null
            Write-Host "  [OK]   Reseau Docker whisper-network cree." -ForegroundColor Green
        }
    }
}

# ========== DEMARRAGE ==========
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Demarrage des applications iahome" -ForegroundColor Cyan
Write-Host "  Projet : $ProjectRoot" -ForegroundColor Gray
if ($script:SkipGradioApps) {
    Write-Host "  [INFO] Apps Gradio (PhotoMaker, BiRefNet...) : IGNOREES" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

# 1. Reseaux Docker
Write-Host "0. Reseaux Docker..." -ForegroundColor Yellow
Ensure-DockerNetwork

# 2. Application principale iahome (Next.js)
Write-Host "`n1. iahome (Next.js) :$PortIahome ..." -ForegroundColor Yellow
Start-NpmDev -Name "iahome" -Path $ProjectRoot -Port $PortIahome

# 3. Prompt Generator
Write-Host "`n2. Prompt Generator :$PortPromptGen ..." -ForegroundColor Yellow
Start-NpmDev -Name "Prompt Generator" -Path $PathPromptGen -Port $PortPromptGen

# 4. Apprendre Autrement
Write-Host "`n3. Apprendre Autrement :9001 ..." -ForegroundColor Yellow
Start-NpmDev -Name "Apprendre Autrement" -Path $PathApprendre -Port 9001

# 5. Photobooth
Write-Host "`n4. Photobooth :$PortPhotobooth ..." -ForegroundColor Yellow
Start-NpmDev -Name "Photobooth" -Path $PathPhotobooth -Port $PortPhotobooth -Script "start"

# 6. Home Assistant
Write-Host "`n5. Home Assistant :$PortHomeAssistant ..." -ForegroundColor Yellow
Start-HomeAssistant

# 7. Apps Gradio
Write-Host "`n6. PhotoMaker :$PortPhotomaker ..." -ForegroundColor Yellow
Start-GradioApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker

Write-Host "`n7. BiRefNet :$PortBirefnet ..." -ForegroundColor Yellow
Start-GradioApp -Name "BiRefNet" -Path $BirefnetPath -Port $PortBirefnet

Write-Host "`n8. Florence-2 :$PortFlorence2 ..." -ForegroundColor Yellow
Start-GradioApp -Name "Florence-2" -Path $Florence2Path -Port $PortFlorence2

Write-Host "`n9. Animagine XL :$PortAnimagineXL ..." -ForegroundColor Yellow
Start-GradioApp -Name "Animagine XL" -Path $AnimagineXLPath -Port $PortAnimagineXL

# 10. Services Docker
Write-Host "`n10. Meeting Reports (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Meeting Reports" -Path $DockerMeetingReports

Write-Host "`n11. Stirling PDF (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Stirling PDF" -Path $DockerPdf

Write-Host "`n12. LibreSpeed (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "LibreSpeed" -Path $DockerLibrespeed

Write-Host "`n13. MeTube (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "MeTube" -Path $DockerMetube

Write-Host "`n14. Voice Isolation (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Voice Isolation" -Path $DockerVoiceIsolation

Write-Host "`n15. Whisper Service (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Whisper Service" -Path $DockerWhisper

Write-Host "`n16. PsiTransfer (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "PsiTransfer" -Path $DockerPsitransfer

Write-Host "`n17. QR Codes (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "QR Codes" -Path $DockerQrcodes

# 18. Meeting Reports frontend en mode dev (si pas Docker)
if (-not (Test-PortInUse -Port $PortMeetingReports)) {
    $mrFrontend = Join-Path $DockerMeetingReports "frontend"
    if (Test-Path (Join-Path $mrFrontend "package.json")) {
        Write-Host "`n18. Meeting Reports Frontend (npm) :$PortMeetingReports ..." -ForegroundColor Yellow
        try {
            $psi = New-Object System.Diagnostics.ProcessStartInfo
            $psi.FileName = "cmd"
            $psi.Arguments = "/c set PORT=$PortMeetingReports && npm start"
            $psi.WorkingDirectory = $mrFrontend
            $psi.UseShellExecute = $true
            $psi.CreateNoWindow = $false
            [System.Diagnostics.Process]::Start($psi)
            Write-Host "  [OK]   Meeting Reports Frontend demarre (port $PortMeetingReports)." -ForegroundColor Green
        } catch {
            Write-Host "  [SKIP] Meeting Reports Frontend : $($_.Exception.Message)" -ForegroundColor DarkGray
        }
    }
}

# ========== RECAP ==========
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Demarrage termine" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host @"

  URLs principales :
    - iahome          : http://localhost:$PortIahome
    - Prompt Generator: http://localhost:$PortPromptGen
    - Apprendre Autrement : http://localhost:9001
    - Photobooth      : http://localhost:$PortPhotobooth
    - Home Assistant  : http://localhost:$PortHomeAssistant
    - PhotoMaker      : http://localhost:$PortPhotomaker
    - LibreSpeed      : http://localhost:8083 (Docker)
    - Stirling PDF   : http://localhost:8086 (Docker)
    - Voice Isolation : http://localhost:$PortVoiceIsolation (Docker)
    - Meeting Reports : http://localhost:$PortMeetingReports
    - PsiTransfer      : (via proxy iahome)
    - Whisper          : http://localhost:8093 (Docker)

  Config Gradio : scripts\apps-hosts.config.ps1
  Fermez les fenetres pour arreter les applications.

"@ -ForegroundColor White
