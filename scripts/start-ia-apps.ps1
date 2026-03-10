# Demarre les apps IA : PhotoMaker, Animagine XL, Florence-2, BiRefNet (en parallele)
# Usage : .\scripts\start-ia-apps.ps1
# Depuis la racine iahome.

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot

$ConfigFile = Join-Path $PSScriptRoot "apps-hosts.config.ps1"
if (Test-Path $ConfigFile) { . $ConfigFile }

# Cache Hugging Face pour eviter de retelecharger les modeles a chaque demarrage
$DefaultModelsCache = Join-Path $ProjectRoot "models-cache"
if (-not $ModelsCachePath) { $ModelsCachePath = $DefaultModelsCache }
if (-not (Test-Path $ModelsCachePath)) { New-Item -ItemType Directory -Path $ModelsCachePath -Force | Out-Null }
$env:HF_HOME = $ModelsCachePath
$env:HF_HUB_CACHE = Join-Path $ModelsCachePath "hub"
$env:TRANSFORMERS_CACHE = Join-Path $ModelsCachePath "transformers"

$PhotomakerPath  = if ($PhotomakerPath)  { $PhotomakerPath }  else { Join-Path $ProjectRoot "gradio-apps\photomaker" }
$AnimagineXLPath = if ($AnimagineXLPath) { $AnimagineXLPath } else { Join-Path $ProjectRoot "gradio-apps\animagine-xl" }
$Florence2Path   = if ($Florence2Path)   { $Florence2Path }   else { Join-Path $ProjectRoot "gradio-apps\florence-2" }
$BirefnetPath    = if ($BirefnetPath)    { $BirefnetPath }    else { Join-Path $ProjectRoot "gradio-apps\birefnet" }

$PortPhotomaker  = 7881
$PortAnimagineXL = 7883
$PortFlorence2   = 7884
$PortBirefnet    = 7882

function Test-PortInUse {
    param([int]$Port)
    try {
        $conn = Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue
        return ($null -ne $conn)
    } catch {
        return (netstat -ano 2>$null | Select-String ":$Port\s" -Quiet)
    }
}

function Ensure-AppDependencies {
    param([string]$Path, [string]$Name)
    $pipExe = Join-Path $Path ".venv\Scripts\pip.exe"
    if (-not (Test-Path $pipExe)) { return }
    # spaces : requis par les apps Gradio HF
    $null = & $pipExe show spaces 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  [INFO] Installation de 'spaces'..." -ForegroundColor DarkGray
        & $pipExe install spaces -q 2>$null
    }
    # matplotlib : requis par Florence-2
    if ($Name -eq "Florence-2") {
        $null = & $pipExe show matplotlib 2>$null
        if ($LASTEXITCODE -ne 0) {
            Write-Host "  [INFO] Installation de 'matplotlib'..." -ForegroundColor DarkGray
            & $pipExe install matplotlib -q 2>$null
        }
    }
}

function Start-IAApp {
    param([string]$Name, [string]$Path, [int]$Port)
    if (-not $Path -or -not (Test-Path $Path)) {
        Write-Host "  [SKIP] $Name : dossier introuvable ($Path)" -ForegroundColor DarkGray
        return
    }
    $appPy = Join-Path $Path "app.py"
    if (-not (Test-Path $appPy)) {
        Write-Host "  [SKIP] $Name : app.py introuvable" -ForegroundColor DarkGray
        return
    }
    Ensure-AppDependencies -Path $Path -Name $Name
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : deja en cours (port $Port)" -ForegroundColor Green
        return
    }
    $pythonExe = "python"
    $venvPython = Join-Path $Path ".venv\Scripts\python.exe"
    if (Test-Path $venvPython) { $pythonExe = $venvPython }
    try {
        $env:GRADIO_SERVER_PORT = $Port
        $env:GRADIO_SERVER_NAME = "0.0.0.0"
        $psi = New-Object System.Diagnostics.ProcessStartInfo
        $psi.FileName = $pythonExe
        $psi.Arguments = "app.py"
        $psi.WorkingDirectory = $Path
        $psi.UseShellExecute = $true
        $psi.CreateNoWindow = $false
        $p = [System.Diagnostics.Process]::Start($psi)
        Write-Host "  [OK]   $Name demarre (port $Port, PID $($p.Id))" -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Demarrage des apps IA" -ForegroundColor Cyan
Write-Host "  Cache modeles: $ModelsCachePath" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. PhotoMaker :$PortPhotomaker ..." -ForegroundColor Yellow
Start-IAApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker

Write-Host "`n2. Animagine XL :$PortAnimagineXL ..." -ForegroundColor Yellow
Start-IAApp -Name "Animagine XL" -Path $AnimagineXLPath -Port $PortAnimagineXL

Write-Host "`n3. Florence-2 :$PortFlorence2 ..." -ForegroundColor Yellow
Start-IAApp -Name "Florence-2" -Path $Florence2Path -Port $PortFlorence2

Write-Host "`n4. BiRefNet :$PortBirefnet ..." -ForegroundColor Yellow
Start-IAApp -Name "BiRefNet" -Path $BirefnetPath -Port $PortBirefnet

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  URLs :" -ForegroundColor White
Write-Host "    PhotoMaker    : http://localhost:$PortPhotomaker" -ForegroundColor Gray
Write-Host "    Animagine XL  : http://localhost:$PortAnimagineXL" -ForegroundColor Gray
Write-Host "    Florence-2   : http://localhost:$PortFlorence2" -ForegroundColor Gray
Write-Host "    BiRefNet     : http://localhost:$PortBirefnet" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
