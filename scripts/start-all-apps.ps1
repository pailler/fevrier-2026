#requires -Version 5.1
<#
.SYNOPSIS
  Lance en parallèle les services de développement / Docker attendus par iahome.
.DESCRIPTION
  - Next.js (iahome, prompt-generator, cv-generator, apprendre-autrement, photobooth) via npm
  - Apps Python Gradio (PhotoMaker, BiRefNet, Florence-2, Animagine XL, MuseTalk) via .venv ou python
  - Home Assistant (fichiers statiques) via python -m http.server
  - Stacks docker compose (meeting-reports, PDF, essentiels, etc.)
  Optionnel : scripts\apps-hosts.config.ps1 pour chemins / URL Gradio.
.PARAMETER SkipGradioApps
  Ne démarre pas les applications Gradio (PhotoMaker, BiRefNet, etc.).
.PARAMETER PhotoMakerOnly
  Démarre uniquement PhotoMaker (port 7881) — pris en charge par start-photomaker.ps1.
.PARAMETER Restart
  Avant de lancer, arrête les processus qui écoutent sur les mêmes ports (Next, npm, Python / Gradio).
  Ne modifie pas les conteneurs Docker : pour eux, utiliser « docker compose restart » dans chaque dossier ou l’UI Docker.
.EXAMPLE
  .\scripts\start-all-apps.ps1
.EXAMPLE
  .\scripts\start-all-apps.ps1 -SkipGradioApps
.EXAMPLE
  .\scripts\start-all-apps.ps1 -Restart
#>
param(
    [switch]$SkipGradioApps,
    [switch]$PhotoMakerOnly,
    [switch]$Restart
)

$ErrorActionPreference = "Continue"
$ScriptRoot = $PSScriptRoot
$ProjectRoot = Split-Path -Parent $ScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = (Get-Location).Path
}
Set-Location -LiteralPath $ProjectRoot
. (Join-Path $ScriptRoot "port-utils.ps1")
. (Join-Path $ScriptRoot "models-path.config.ps1")

$ConfigFile = Join-Path $ScriptRoot "apps-hosts.config.ps1"
if (Test-Path -LiteralPath $ConfigFile) {
    . $ConfigFile
}

$CmdLineSkipGradio = $SkipGradioApps.IsPresent
$script:SkipGradioApps = $CmdLineSkipGradio -or (
    $null -ne (Get-Variable -Name "SkipGradioApps" -Scope 0 -ErrorAction SilentlyContinue) -and [bool]$SkipGradioApps
)

# --- Cache modeles Hugging Face — Stability Matrix ---
if (-not (Set-IaHomeModelsEnv -Quiet)) {
    Write-Host "[ERREUR] Stability Matrix introuvable pour le cache modeles." -ForegroundColor Red
    exit 1
}
$ModelsCachePath = Get-IaHomeModelsCachePath

# Évite l’erreur « localhost is not accessible » côté clients Gradio (proxy Windows)
$env:NO_PROXY = "localhost,127.0.0.1,::1"
$env:no_proxy = $env:NO_PROXY

# --- Chemins apps Gradio (surchargables via apps-hosts.config.ps1) ---
if (-not $PhotomakerPath)   { $PhotomakerPath   = Join-Path $ProjectRoot "gradio-apps\photomaker" }
if (-not $BirefnetPath)     { $BirefnetPath     = Join-Path $ProjectRoot "gradio-apps\birefnet" }
if (-not $Florence2Path)    { $Florence2Path    = Join-Path $ProjectRoot "gradio-apps\florence-2" }
if (-not $AnimagineXLPath)  { $AnimagineXLPath  = Join-Path $ProjectRoot "gradio-apps\animagine-xl" }
if (-not $MuseTalkPath)     { $MuseTalkPath     = Join-Path $ProjectRoot "gradio-apps\musetalk" }

# --- Ports (référence unique + récap final) ---
$Ports = [ordered]@{
    Iahome         = 3000
    PromptGen      = 3002
    CvGenerator    = 3003
    # Compte rendu (Meeting Reports) : port unique 3050 (nginx Docker / npm) — pas 3051/3052.
    MeetingReports = 3050
    # Photobooth en dev : port 7885 (3050 réservé au compte rendu).
    Photobooth     = 7885
    Apprendre      = 9001
    Photomaker     = 7881
    Birefnet       = 7882
    AnimagineXL    = 7883
    Florence2      = 7884
    MuseTalk       = 7886
    HomeAssistant  = 8123
    VoiceIsolation = 8100
    AmbiancesPhotos = 9003
}
$PortIahome         = $Ports.Iahome
$PortPromptGen      = $Ports.PromptGen
$PortCvGenerator    = $Ports.CvGenerator
$PortMeetingReports = $Ports.MeetingReports
$PortPhotobooth     = $Ports.Photobooth
$PortApprendre      = $Ports.Apprendre
$PortPhotomaker     = $Ports.Photomaker
$PortBirefnet       = $Ports.Birefnet
$PortAnimagineXL    = $Ports.AnimagineXL
$PortFlorence2      = $Ports.Florence2
$PortMuseTalk       = $Ports.MuseTalk
$PortHomeAssistant  = $Ports.HomeAssistant
$PortVoiceIsolation = $Ports.VoiceIsolation
$PortAmbiancesPhotos = $Ports.AmbiancesPhotos

$PathPromptGen  = Join-Path $ProjectRoot "prompt-generator"
$PathCvGenerator = Join-Path $ProjectRoot "cv-generator"
$PathApprendre  = Join-Path $ProjectRoot "apprendre-autrement"
$PathPhotobooth = Join-Path $ProjectRoot "photobooth"
$PathCodesHa    = Join-Path $ProjectRoot "essentiels\codes-ha"

$ParentDir = Split-Path -Parent $ProjectRoot
$PathAmbiancesPhotos = Join-Path $ParentDir "ambiancesphotos"
$DockerMeetingReports   = Join-Path $ProjectRoot "meeting-reports"
$DockerPdf              = Join-Path $ProjectRoot "docker-services\essentiels\pdf"
$DockerEssentielsRoot   = Join-Path $ProjectRoot "docker-services\essentiels"
$DockerEssentielsCompose = Join-Path $DockerEssentielsRoot "docker-compose.yml"
$DockerLibrespeed  = if (Test-Path (Join-Path $ProjectRoot "docker-services\essentiels\librespeed")) { Join-Path $ProjectRoot "docker-services\essentiels\librespeed" } else { Join-Path $ProjectRoot "essentiels\librespeed" }
$DockerMetube      = Join-Path $ProjectRoot "docker-services\essentiels\metube"
# Depots souvent a la racine du clone iahome, pas seulement dans le dossier parent
$DockerVoiceIsolation = if (Test-Path (Join-Path $ProjectRoot "voice-isolation-service")) { Join-Path $ProjectRoot "voice-isolation-service" } else { Join-Path $ParentDir "voice-isolation-service" }
$DockerWhisper     = if (Test-Path (Join-Path $ProjectRoot "whisper-service")) { Join-Path $ProjectRoot "whisper-service" } else { Join-Path $ParentDir "whisper-service" }
$DockerPsitransfer = Join-Path $ProjectRoot "essentiels\psitransfer"
$DockerQrcodes     = if (Test-Path (Join-Path $ProjectRoot "docker-services\essentiels\qrcodes")) { Join-Path $ProjectRoot "docker-services\essentiels\qrcodes" } else { Join-Path $ProjectRoot "essentiels\qrcodes" }

# $PhotoMakerGradioRootUrl (optionnel) : apps-hosts.config.ps1

# =============================================================================
# Environnement processus (restauration systématique après chaque lancement)
# =============================================================================

function Invoke-WithProcessEnv {
    <#
    Les enfants héritent des variables du processus PowerShell (Process::Start, UseShellExecute).
    Toute clé listée ici est sauvegardée puis restaurée dans finally.
    #>
    [CmdletBinding()]
    param(
        [hashtable]$Env = @{},
        [Parameter(Mandatory = $true)]
        [scriptblock]$Action
    )
    if ($null -eq $Env -or $Env.Count -eq 0) {
        return & $Action
    }
    $backup = @{}
    foreach ($k in $Env.Keys) {
        $backup[$k] = [Environment]::GetEnvironmentVariable($k, "Process")
    }
    try {
        foreach ($k in $Env.Keys) {
            [void][Environment]::SetEnvironmentVariable($k, [string]$Env[$k], "Process")
        }
        return & $Action
    } finally {
        foreach ($k in $Env.Keys) {
            if ($null -ne $backup[$k] -and $backup[$k] -ne "") {
                [void][Environment]::SetEnvironmentVariable($k, $backup[$k], "Process")
            } else {
                [void][Environment]::SetEnvironmentVariable($k, $null, "Process")
            }
        }
    }
}

function Start-ChildProcessInDir {
    param(
        [string]$FileName,
        [string]$Arguments = "",
        [string]$WorkingDirectory
    )
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $FileName
    $psi.Arguments = $Arguments
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $true
    $psi.CreateNoWindow = $false
    return [System.Diagnostics.Process]::Start($psi)
}

function Start-ChildProcessInDirWithEnv {
    <#
    Lancement sans shell (UseShellExecute=false) : les variables d'environnement
    sont appliquees de facon fiable a l'enfant (ex. PHOTOBOOTH_PORT pour le node
    lance par npm, ce qui n'est pas garanti avec le seul $env: du process parent).
    #>
    param(
        [string]$FileName,
        [string]$Arguments = "",
        [string]$WorkingDirectory,
        [hashtable]$SetEnv
    )
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $FileName
    $psi.Arguments = $Arguments
    $psi.WorkingDirectory = $WorkingDirectory
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $false
    foreach ($de in [System.Environment]::GetEnvironmentVariables().GetEnumerator()) {
        $k = [string]$de.Key
        $v = [string]$de.Value
        try {
            if ($psi.EnvironmentVariables.ContainsKey($k)) { $psi.EnvironmentVariables[$k] = $v }
            else { $null = $psi.EnvironmentVariables.Add($k, $v) }
        } catch { /* cle reservee, ignoree */ }
    }
    if ($SetEnv) {
        foreach ($key in $SetEnv.Keys) {
            $v = [string]$SetEnv[$key]
            if ($psi.EnvironmentVariables.ContainsKey($key)) { $psi.EnvironmentVariables[$key] = $v }
            else { $null = $psi.EnvironmentVariables.Add($key, $v) }
        }
    }
    return [System.Diagnostics.Process]::Start($psi)
}

function Start-NpmApp {
    param(
        [string]$Name,
        [string]$Path,
        [int]$Port,
        [string]$Script = "dev",
        [hashtable]$ExtraEnv = @{}
    )
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Host "  [SKIP] $Name : dossier introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : déjà en cours (port $Port)." -ForegroundColor Green
        return
    }
    $pkg = Join-Path $Path "package.json"
    if (-not (Test-Path -LiteralPath $pkg)) {
        Write-Host "  [SKIP] $Name : package.json introuvable." -ForegroundColor DarkGray
        return
    }
    $envBlock = @{}
    foreach ($k in $ExtraEnv.Keys) { $envBlock[$k] = $ExtraEnv[$k] }
    try {
        $p = $null
        # Photobooth : forcer PHOTOBOOTH_PORT pour le process Node. Avec UseShellExecute=$true, le
        # seul $env: du process parent n'est souvent pas transmis a npm/node sous Windows.
        if ($Name -eq "Photobooth" -and $Port -gt 0) {
            if ($env:OS -eq "Windows_NT") {
                $p = Start-ChildProcessInDir -FileName "cmd.exe" -Arguments "/c set PHOTOBOOTH_PORT=$Port&& npm run $Script" -WorkingDirectory $Path
            } else {
                $p = Start-ChildProcessInDirWithEnv -FileName "npm" -Arguments "run $Script" -WorkingDirectory $Path -SetEnv @{ PHOTOBOOTH_PORT = "$Port" }
            }
        } else {
            $p = Invoke-WithProcessEnv -Env $envBlock -Action {
                Start-ChildProcessInDir -FileName "npm" -Arguments "run $Script" -WorkingDirectory $Path
            }
        }
        Write-Host "  [OK]   $Name démarre (port $Port, PID $($p.Id))." -ForegroundColor Green
        if ($Name -eq "Photobooth") {
            Write-Host "        -> http://localhost:$Port" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-GradioApp {
    param([string]$Name, [string]$Path, [int]$Port, [string]$ExtraPyArgs = "")
    if ($script:SkipGradioApps) {
        Write-Host "  [SKIP] $Name : applications Gradio désactivées." -ForegroundColor DarkGray
        return
    }
    if ([string]::IsNullOrWhiteSpace($Path) -or -not (Test-Path -LiteralPath $Path)) {
        Write-Host "  [SKIP] $Name : chemin non configuré ou introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : déjà en cours (port $Port)." -ForegroundColor Green
        return
    }
    $appPy     = Join-Path $Path "app.py"
    $forgeAppPy = Join-Path $Path "forge_app.py"
    $venvPython = Join-Path $Path ".venv\Scripts\python.exe"
    $pythonExe  = if (Test-Path -LiteralPath $venvPython) { $venvPython } else { "python" }
    if (Test-Path -LiteralPath $forgeAppPy) {
        $scriptArg = "forge_app.py --port $Port --listen"
    } elseif (Test-Path -LiteralPath $appPy) {
        if ($ExtraPyArgs -and $ExtraPyArgs.Trim().Length -gt 0) {
            $scriptArg = "app.py $($ExtraPyArgs.Trim())"
        } else {
            $scriptArg = "app.py"
        }
    } else {
        Write-Host "  [SKIP] $Name : ni app.py ni forge_app.py." -ForegroundColor DarkGray
        return
    }
    $envToSet = @{
        GRADIO_SERVER_PORT = "$Port"
        GRADIO_SERVER_NAME = "0.0.0.0"
    }
    if ($Name -eq "PhotoMaker") {
        $rootUrl = Get-Variable -Name "PhotoMakerGradioRootUrl" -ErrorAction SilentlyContinue
        if ($null -ne $rootUrl -and -not [string]::IsNullOrWhiteSpace($rootUrl.Value)) {
            $envToSet["GRADIO_ROOT_PATH"] = $rootUrl.Value.Trim().TrimEnd([char]'/')
        }
    }
    try {
        $p = Invoke-WithProcessEnv -Env $envToSet -Action {
            Start-ChildProcessInDir -FileName $pythonExe -Arguments $scriptArg -WorkingDirectory $Path
        }
        Write-Host "  [OK]   $Name démarre (port $Port, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-AmbiancesPhotos {
    $script = Join-Path $PathAmbiancesPhotos "serve-ambiancesphotos.py"
    if (-not (Test-Path -LiteralPath $script)) {
        Write-Host "  [SKIP] Ambiances Photos : dossier introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $PortAmbiancesPhotos) {
        Write-Host "  [OK]   Ambiances Photos : déjà en cours (port $PortAmbiancesPhotos)." -ForegroundColor Green
        return
    }
    $pythonCmd = Get-Command python -ErrorAction SilentlyContinue
    $pythonw = if ($pythonCmd) { Join-Path (Split-Path $pythonCmd.Source) "pythonw.exe" } else { "pythonw" }
    if (-not (Test-Path -LiteralPath $pythonw)) { $pythonw = "pythonw" }
    try {
        $p = Start-ChildProcessInDir -FileName $pythonw -Arguments "`"$script`"" -WorkingDirectory $PathAmbiancesPhotos
        Write-Host "  [OK]   Ambiances Photos démarre (port $PortAmbiancesPhotos, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] Ambiances Photos : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-HomeAssistant {
    if (-not (Test-Path -LiteralPath $PathCodesHa)) {
        Write-Host "  [SKIP] Home Assistant : essentiels\codes-ha introuvable." -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $PortHomeAssistant) {
        Write-Host "  [OK]   Home Assistant : déjà en cours (port $PortHomeAssistant)." -ForegroundColor Green
        return
    }
    try {
        $p = Start-ChildProcessInDir -FileName "python" -Arguments "-m http.server $PortHomeAssistant" -WorkingDirectory $PathCodesHa
        Write-Host "  [OK]   Home Assistant démarre (port $PortHomeAssistant, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] Home Assistant : $($_.Exception.Message)" -ForegroundColor Red
    }
}

function Start-DockerCompose {
    param([string]$Name, [string]$Path, [string[]]$Services = $null)
    if (-not (Test-Path -LiteralPath $Path)) {
        Write-Host "  [SKIP] $Name : dossier introuvable." -ForegroundColor DarkGray
        return
    }
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Write-Host "  [SKIP] $Name : Docker indisponible." -ForegroundColor DarkGray
        return
    }
    $composeFile = Join-Path $Path "docker-compose.yml"
    if (-not (Test-Path -LiteralPath $composeFile)) {
        Write-Host "  [SKIP] $Name : docker-compose.yml introuvable." -ForegroundColor DarkGray
        return
    }
    try {
        Push-Location -LiteralPath $Path
        if ($Services -and $Services.Count -gt 0) {
            $dockerArgs = @("compose", "up", "-d") + $Services
            $out = & docker @dockerArgs 2>&1
        } else {
            $out = docker compose up -d 2>&1
        }
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK]   $Name : docker compose lancé." -ForegroundColor Green
        } else {
            Write-Host "  [WARN] $Name : docker compose (code $LASTEXITCODE)." -ForegroundColor Yellow
            if ($out) { Write-Host $out -ForegroundColor DarkGray }
        }
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    } finally {
        Pop-Location
    }
}

function Ensure-DockerNetworks {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) { return }
    foreach ($net in @("iahome-network", "iahome_iahome-network", "whisper-network")) {
        docker network inspect $net 2>$null | Out-Null
        if ($LASTEXITCODE -ne 0) {
            $null = docker network create $net 2>$null
            Write-Host "  [OK]   Réseau Docker créé : $net" -ForegroundColor Green
        }
    }
}

function Stop-IahomeLocalPorts {
    <#
    Libère les ports servis en local (node / python). Les stacks Docker ne sont pas arrêtées ici
    (compose hétérogène, noms de services, volumes — à gérer à part si besoin).
    #>
    param(
        [bool]$IsPhotoMakerOnly = $false,
        [bool]$IsSkipGradio = $false
    )
    if ($IsPhotoMakerOnly) {
        $portList = @($PortPhotomaker)
    } else {
        $portList = @(
            $PortIahome, $PortPromptGen, $PortCvGenerator, $PortApprendre, $PortPhotobooth,
            $PortMeetingReports, $PortHomeAssistant, $PortAmbiancesPhotos
        )
        if (-not $IsSkipGradio) {
            $portList += @(
                $PortPhotomaker, $PortBirefnet, $PortAnimagineXL, $PortFlorence2, $PortMuseTalk
            )
        }
    }
    $anyStopped = $false
    foreach ($p in ($portList | Sort-Object -Unique)) {
        if (-not (Test-PortInUse -Port $p)) { continue }
        $n = Stop-ListenersOnPort -Port $p -Quiet
        if ($n -gt 0) {
            $anyStopped = $true
            Write-Host "  Port $p : $n processus arretes." -ForegroundColor Yellow
        }
    }
    if ($anyStopped) {
        Start-Sleep -Milliseconds 600
    }
}

function Start-MeetingReportsFrontend {
    if (Test-PortInUse -Port $PortMeetingReports) { return }
    $mrFrontend = Join-Path $DockerMeetingReports "frontend"
    if (-not (Test-Path (Join-Path $mrFrontend "package.json"))) { return }
    try {
        $p = Invoke-WithProcessEnv -Env @{ PORT = "$PortMeetingReports" } -Action {
            Start-ChildProcessInDir -FileName "npm" -Arguments "start" -WorkingDirectory $mrFrontend
        }
        Write-Host "  [OK]   Meeting Reports frontend démarre (port $PortMeetingReports, PID $($p.Id))." -ForegroundColor Green
    } catch {
        Write-Host "  [SKIP] Meeting Reports frontend : $($_.Exception.Message)" -ForegroundColor DarkGray
    }
}

# =============================================================================
# Exécution
# =============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Démarrage des applications iahome" -ForegroundColor Cyan
if ($PhotoMakerOnly) {
    Write-Host "  Mode : PhotoMaker uniquement (port $PortPhotomaker)" -ForegroundColor Yellow
}
if ($Restart) {
    Write-Host "  Mode : redemarrage (arret des ports locaux, Docker inchange)" -ForegroundColor Yellow
}
Write-Host "  Projet : $ProjectRoot" -ForegroundColor Gray
if ($script:SkipGradioApps) {
    Write-Host "  [INFO] Gradio (PhotoMaker, BiRefNet, …) : ignoré" -ForegroundColor Yellow
}
Write-Host "========================================`n" -ForegroundColor Cyan

if ($PhotoMakerOnly) {
    if ($Restart) {
        Write-Host "• Arret prealable (port $PortPhotomaker)…" -ForegroundColor DarkYellow
        Stop-IahomeLocalPorts -IsPhotoMakerOnly $true -IsSkipGradio $true
    }
    Write-Host "• PhotoMaker :$PortPhotomaker …" -ForegroundColor Yellow
    Start-GradioApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker
    Write-Host "`n  → http://localhost:$PortPhotomaker`n" -ForegroundColor White
    exit 0
}

if ($Restart) {
    Write-Host "• Arret prealable (Node / Python sur les ports iahome)…" -ForegroundColor DarkYellow
    Write-Host "  (les conteneurs Docker ne sont pas arretes ici ; voir parametre -Restart)" -ForegroundColor DarkGray
    Stop-IahomeLocalPorts -IsPhotoMakerOnly $false -IsSkipGradio $([bool]$script:SkipGradioApps)
    Write-Host ""
}

Write-Host "• Réseaux Docker requis…" -ForegroundColor Yellow
Ensure-DockerNetworks

Write-Host "`n• iahome (Next.js) :$PortIahome …" -ForegroundColor Yellow
Start-NpmApp -Name "iahome" -Path $ProjectRoot -Port $PortIahome

Write-Host "`n• Prompt Generator :$PortPromptGen …" -ForegroundColor Yellow
Start-NpmApp -Name "Prompt Generator" -Path $PathPromptGen -Port $PortPromptGen

Write-Host "`n• Générateur de CV :$PortCvGenerator …" -ForegroundColor Yellow
Start-NpmApp -Name "CV Generator" -Path $PathCvGenerator -Port $PortCvGenerator

Write-Host "`n• Apprendre Autrement :$PortApprendre …" -ForegroundColor Yellow
Start-NpmApp -Name "Apprendre Autrement" -Path $PathApprendre -Port $PortApprendre

Write-Host "`n• Photobooth :$PortPhotobooth …" -ForegroundColor Yellow
Start-NpmApp -Name "Photobooth" -Path $PathPhotobooth -Port $PortPhotobooth -Script "start"

Write-Host "`n• Home Assistant :$PortHomeAssistant …" -ForegroundColor Yellow
Start-HomeAssistant

Write-Host "`n• Ambiances Photos :$PortAmbiancesPhotos …" -ForegroundColor Yellow
Start-AmbiancesPhotos

Write-Host "`n• PhotoMaker :$PortPhotomaker …" -ForegroundColor Yellow
Start-GradioApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker

Write-Host "`n• BiRefNet :$PortBirefnet …" -ForegroundColor Yellow
Start-GradioApp -Name "BiRefNet" -Path $BirefnetPath -Port $PortBirefnet

Write-Host "`n• Florence-2 :$PortFlorence2 …" -ForegroundColor Yellow
Start-GradioApp -Name "Florence-2" -Path $Florence2Path -Port $PortFlorence2

Write-Host "`n• Animagine XL :$PortAnimagineXL …" -ForegroundColor Yellow
Start-GradioApp -Name "Animagine XL" -Path $AnimagineXLPath -Port $PortAnimagineXL

Write-Host "`n• MuseTalk :$PortMuseTalk …" -ForegroundColor Yellow
Start-GradioApp -Name "MuseTalk" -Path $MuseTalkPath -Port $PortMuseTalk -ExtraPyArgs "--port $PortMuseTalk --ip 0.0.0.0 --use_float16"

Write-Host "`n• Meeting Reports (Docker)…" -ForegroundColor Yellow
Start-DockerCompose -Name "Meeting Reports" -Path $DockerMeetingReports

Write-Host "`n• Stirling PDF (Docker)…" -ForegroundColor Yellow
Start-DockerCompose -Name "Stirling PDF" -Path $DockerPdf

Write-Host "`n• Essentiels Docker (LibreSpeed, QR codes, MeTube, n8n)…" -ForegroundColor Yellow
if (Test-Path -LiteralPath $DockerEssentielsCompose) {
    Start-DockerCompose -Name "Essentiels" -Path $DockerEssentielsRoot -Services @("librespeed", "qrcodes", "metube", "n8n")
} else {
    Write-Host "  [INFO] Compose parent introuvable : lancement par dossiers séparés." -ForegroundColor DarkGray
    Write-Host "`n• LibreSpeed (Docker)…" -ForegroundColor Yellow
    Start-DockerCompose -Name "LibreSpeed" -Path $DockerLibrespeed
    Write-Host "`n• MeTube (Docker)…" -ForegroundColor Yellow
    Start-DockerCompose -Name "MeTube" -Path $DockerMetube
    Write-Host "`n• QR codes (Docker)…" -ForegroundColor Yellow
    Start-DockerCompose -Name "QR codes" -Path $DockerQrcodes
}

Write-Host "`n• Voice Isolation (Docker)…" -ForegroundColor Yellow
Start-DockerCompose -Name "Voice Isolation" -Path $DockerVoiceIsolation

Write-Host "`n• Whisper (Docker)…" -ForegroundColor Yellow
Start-DockerCompose -Name "Whisper" -Path $DockerWhisper

Write-Host "`n• PsiTransfer (Docker)…" -ForegroundColor Yellow
Start-DockerCompose -Name "PsiTransfer" -Path $DockerPsitransfer

Write-Host "`n• Meeting Reports (npm, $PortMeetingReports)…" -ForegroundColor Yellow
Start-MeetingReportsFrontend

# =============================================================================
# Récap
# =============================================================================

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Terminé" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host @"

  URLs principales :
    iahome              http://localhost:$PortIahome
    Prompt Generator    http://localhost:$PortPromptGen
    Générateur de CV    http://localhost:$PortCvGenerator/cv
    Apprendre Autrement http://localhost:$PortApprendre
    Photobooth          http://localhost:$PortPhotobooth
    Home Assistant      http://localhost:$PortHomeAssistant
    Ambiances Photos    http://localhost:$PortAmbiancesPhotos / https://ambiancesphotos.fr/
    PhotoMaker          http://localhost:$PortPhotomaker
    BiRefNet            http://localhost:$PortBirefnet
    Florence-2          http://localhost:$PortFlorence2
    Animagine XL        http://localhost:$PortAnimagineXL
    MuseTalk            http://localhost:$PortMuseTalk
    Meeting Reports     http://localhost:$PortMeetingReports
    LibreSpeed          http://localhost:8085
    QR codes            http://localhost:7006
    MeTube              http://localhost:8081
    n8n                 http://localhost:5678
    Stirling PDF        http://localhost:8086
    Voice Isolation     http://localhost:$PortVoiceIsolation
    Whisper             http://localhost:8093
  PsiTransfer : via proxy / module iahome (pas d'URL locale fixe).

  Config : scripts\apps-hosts.config.ps1
  Fermer les fenêtres console pour arrêter les processus Node / Python lancés ici.
  Redemarrer le stack local (sans Docker) : .\scripts\start-all-apps.ps1 -Restart

"@ -ForegroundColor White
