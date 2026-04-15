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

# Parametres optionnels :
# -SkipGradioApps : ignorer PhotoMaker/BiRefNet/Florence-2/Animagine XL/MuseTalk
# -PhotoMakerOnly : demarrer uniquement PhotoMaker (utilise par start-photomaker.ps1)
param([switch]$SkipGradioApps, [switch]$PhotoMakerOnly)
$CmdLineSkipGradio = $SkipGradioApps.IsPresent

# Charger la config des apps Gradio si elle existe
$ConfigFile = Join-Path $PSScriptRoot "apps-hosts.config.ps1"
if (Test-Path $ConfigFile) {
    . $ConfigFile
}

# SkipGradioApps : -SkipGradioApps en ligne de commande OU $SkipGradioApps dans config
$script:SkipGradioApps = $CmdLineSkipGradio -or ($null -ne (Get-Variable -Name "SkipGradioApps" -Scope 0 -ErrorAction SilentlyContinue) -and [bool]$SkipGradioApps)

# Cache Hugging Face pour BiRefNet, Animagine XL, Florence-2, PhotoMaker, MuseTalk - evite les telechargements repetes
# (PhotoMakerOnly utilise ~/.cache/huggingface par defaut pour les modeles deja telecharges)
$DefaultModelsCache = Join-Path $ProjectRoot "models-cache"
if (-not $ModelsCachePath) { $ModelsCachePath = $DefaultModelsCache }
if (-not (Test-Path $ModelsCachePath)) { New-Item -ItemType Directory -Path $ModelsCachePath -Force | Out-Null }
if (-not $PhotoMakerOnly) {
    $env:HF_HOME = $ModelsCachePath
    $env:HF_HUB_CACHE = Join-Path $ModelsCachePath "hub"
    $env:TRANSFORMERS_CACHE = Join-Path $ModelsCachePath "transformers"
}

# Eviter erreur "localhost is not accessible" pour apps Gradio (proxy Windows)
$env:NO_PROXY = "localhost,127.0.0.1,::1"
$env:no_proxy = $env:NO_PROXY

# Chemins par defaut pour les apps Gradio (surchargeables via apps-hosts.config.ps1)
if (-not $PhotomakerPath)   { $PhotomakerPath   = Join-Path $ProjectRoot "gradio-apps\photomaker" }
if (-not $BirefnetPath)     { $BirefnetPath     = Join-Path $ProjectRoot "gradio-apps\birefnet" }
if (-not $Florence2Path)    { $Florence2Path    = Join-Path $ProjectRoot "gradio-apps\florence-2" }
if (-not $AnimagineXLPath)  { $AnimagineXLPath  = Join-Path $ProjectRoot "gradio-apps\animagine-xl" }
if (-not $MuseTalkPath)      { $MuseTalkPath      = Join-Path $ProjectRoot "gradio-apps\musetalk" }

# Ports standard
$PortIahome         = 3000
$PortPromptGen     = 3002
$PortMeetingReports= 3050
$PortPhotomaker    = 7881
$PortBirefnet      = 7882
$PortAnimagineXL   = 7883
$PortFlorence2     = 7884
$PortPhotobooth    = 7885
$PortMuseTalk      = 7886
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
# Stack unifie : librespeed + qrcodes + metube + n8n (ports exposes : 8085, 7006, 8081, 5678)
$DockerEssentielsRoot = Join-Path $ProjectRoot "docker-services\essentiels"
$DockerEssentielsCompose = Join-Path $DockerEssentielsRoot "docker-compose.yml"
# Fallback si pas de compose parent (install partielle)
$DockerLibrespeed     = if (Test-Path (Join-Path $ProjectRoot "docker-services\essentiels\librespeed")) { Join-Path $ProjectRoot "docker-services\essentiels\librespeed" } else { Join-Path $ProjectRoot "essentiels\librespeed" }
$DockerMetube         = Join-Path $ProjectRoot "docker-services\essentiels\metube"
$DockerVoiceIsolation = Join-Path $ParentDir "voice-isolation-service"
$DockerWhisper        = Join-Path $ParentDir "whisper-service"
$DockerPsitransfer    = Join-Path $ProjectRoot "essentiels\psitransfer"
$DockerQrcodes        = if (Test-Path (Join-Path $ProjectRoot "docker-services\essentiels\qrcodes")) { Join-Path $ProjectRoot "docker-services\essentiels\qrcodes" } else { Join-Path $ProjectRoot "essentiels\qrcodes" }

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
    param([string]$Name, [string]$Path, [int]$Port, [string]$ExtraPyArgs = "")
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
    $venvPython = Join-Path $Path ".venv\Scripts\python.exe"
    $pythonExe = if (Test-Path $venvPython) { $venvPython } else { "python" }
    $scriptArg = ""
    if (Test-Path $forgeAppPy) {
        $scriptArg = "forge_app.py --port $Port --listen"
    } elseif (Test-Path $appPy) {
        if ($ExtraPyArgs -and $ExtraPyArgs.Trim().Length -gt 0) {
            $scriptArg = "app.py $($ExtraPyArgs.Trim())"
        } else {
            $scriptArg = "app.py"
        }
    } else {
        Write-Host "  [SKIP] $Name : ni app.py ni forge_app.py." -ForegroundColor DarkGray
        return
    }
    try {
        $env:GRADIO_SERVER_PORT = $Port
        $env:GRADIO_SERVER_NAME = "0.0.0.0"
        $oldGradioRootPath = $env:GRADIO_ROOT_PATH
        if ($Name -eq "PhotoMaker" -and $PhotoMakerGradioRootUrl) {
            $env:GRADIO_ROOT_PATH = $PhotoMakerGradioRootUrl.Trim().TrimEnd('/')
        }
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $pythonExe
        $psi.Arguments = $scriptArg
        $psi.WorkingDirectory = $Path
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $p = [System.Diagnostics.Process]::Start($psi)
        if ($null -ne $oldGradioRootPath) { $env:GRADIO_ROOT_PATH = $oldGradioRootPath }
        else { Remove-Item Env:GRADIO_ROOT_PATH -ErrorAction SilentlyContinue }
        Write-Host "  [OK]   $Name demarre (port $Port, PID $($p.Id))." -ForegroundColor Green
    } catch {
        if ($null -ne $oldGradioRootPath) { $env:GRADIO_ROOT_PATH = $oldGradioRootPath }
        else { Remove-Item Env:GRADIO_ROOT_PATH -ErrorAction SilentlyContinue }
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
    param([string]$Name, [string]$Path, [string[]]$Services = $null)
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
        if ($Services -and $Services.Count -gt 0) {
            $dockerArgs = @("compose", "up", "-d") + $Services
            $out = & docker @dockerArgs 2>&1
        } else {
            $out = docker compose up -d 2>&1
        }
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK]   $Name demarre (Docker)." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $Name : erreur docker compose (code $LASTEXITCODE)." -ForegroundColor Yellow
            if ($out) { Write-Host $out -ForegroundColor DarkGray }
        }
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

# Creer les reseaux Docker externes attendus par docker-services/essentiels (qrcodes, metube, etc.)
function Ensure-DockerNetwork {
    if (Get-Command docker -ErrorAction SilentlyContinue) {
        function Ensure-OneNetwork([string]$NetName) {
            docker network inspect $NetName 2>$null | Out-Null
            if ($LASTEXITCODE -ne 0) {
                docker network create $NetName 2>$null
                Write-Host "  [OK]   Reseau Docker $NetName cree." -ForegroundColor Green
            }
        }
        Ensure-OneNetwork "iahome-network"
        # Requis par le service qrcodes du compose parent (external: true)
        Ensure-OneNetwork "iahome_iahome-network"
        Ensure-OneNetwork "whisper-network"
    }
}

# ========== DEMARRAGE ==========
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Demarrage des applications iahome" -ForegroundColor Cyan
if ($PhotoMakerOnly) {
    Write-Host "  Mode : PhotoMaker uniquement (port $PortPhotomaker)" -ForegroundColor Yellow
}
Write-Host "  Projet : $ProjectRoot" -ForegroundColor Gray
if ($script:SkipGradioApps) {
    Write-Host "  [INFO] Apps Gradio (PhotoMaker, BiRefNet...) : IGNOREES" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

if ($PhotoMakerOnly) {
    Write-Host "6. PhotoMaker :$PortPhotomaker ..." -ForegroundColor Yellow
    Start-GradioApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker
    Write-Host "`n  PhotoMaker : http://localhost:$PortPhotomaker`n" -ForegroundColor White
    exit 0
}

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

Write-Host "`n10. MuseTalk :$PortMuseTalk ..." -ForegroundColor Yellow
Start-GradioApp -Name "MuseTalk" -Path $MuseTalkPath -Port $PortMuseTalk -ExtraPyArgs "--port $PortMuseTalk --ip 0.0.0.0 --use_float16"

# 11. Services Docker
Write-Host "`n11. Meeting Reports (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Meeting Reports" -Path $DockerMeetingReports

Write-Host "`n12. Stirling PDF (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Stirling PDF" -Path $DockerPdf

# LibreSpeed, QR codes, MeTube, n8n : un seul compose parent (Metube seul n'expose pas les ports en local)
Write-Host "`n13. Essentiels Docker (LibreSpeed, QR codes, MeTube, n8n) ..." -ForegroundColor Yellow
if (Test-Path $DockerEssentielsCompose) {
    Start-DockerCompose -Name "Essentiels (LibreSpeed, QR codes, MeTube, n8n)" -Path $DockerEssentielsRoot -Services @("librespeed", "qrcodes", "metube", "n8n")
} else {
    Write-Host "  [INFO] Compose parent introuvable : demarrage par dossiers separes." -ForegroundColor DarkGray
    Write-Host "`n13a. LibreSpeed (Docker) ..." -ForegroundColor Yellow
    Start-DockerCompose -Name "LibreSpeed" -Path $DockerLibrespeed
    Write-Host "`n13b. MeTube (Docker) ..." -ForegroundColor Yellow
    Start-DockerCompose -Name "MeTube" -Path $DockerMetube
    Write-Host "`n13c. QR Codes (Docker) ..." -ForegroundColor Yellow
    Start-DockerCompose -Name "QR Codes" -Path $DockerQrcodes
}

Write-Host "`n14. Voice Isolation (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Voice Isolation" -Path $DockerVoiceIsolation

Write-Host "`n15. Whisper Service (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "Whisper Service" -Path $DockerWhisper

Write-Host "`n16. PsiTransfer (Docker) ..." -ForegroundColor Yellow
Start-DockerCompose -Name "PsiTransfer" -Path $DockerPsitransfer

# 17. Meeting Reports frontend en mode dev (si pas Docker)
if (-not (Test-PortInUse -Port $PortMeetingReports)) {
    $mrFrontend = Join-Path $DockerMeetingReports "frontend"
    if (Test-Path (Join-Path $mrFrontend "package.json")) {
        Write-Host "`n17. Meeting Reports Frontend (npm) :$PortMeetingReports ..." -ForegroundColor Yellow
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
    - MuseTalk        : http://localhost:$PortMuseTalk (lip-sync video, GPU)
    - LibreSpeed      : http://localhost:8085 (Docker, stack essentiels)
    - QR codes        : http://localhost:7006 (Docker)
    - MeTube          : http://localhost:8081 (Docker)
    - n8n             : http://localhost:5678 (Docker, auth admin/admin par defaut)
    - Stirling PDF    : http://localhost:8086 (Docker)
    - Voice Isolation : http://localhost:$PortVoiceIsolation (Docker)
    - Meeting Reports : http://localhost:$PortMeetingReports
    - PsiTransfer      : (via proxy iahome)
    - Whisper          : http://localhost:8093 (Docker)

  Config Gradio : scripts\apps-hosts.config.ps1
  Fermez les fenetres pour arreter les applications.

"@ -ForegroundColor White
