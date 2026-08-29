# Demarre les apps IA : PhotoMaker, Animagine XL, Florence-2, BiRefNet, MuseTalk (en parallele)
# Usage : .\scripts\start-ia-apps.ps1
#         .\scripts\start-ia-apps.ps1 -InstallMissingDeps   # pip install si module manquant (peut etre long)
# Depuis la racine iahome.
param(
    # Sans ce switch : pas d'install pip automatique (evite de bloquer longtemps sur PhotoMaker, etc.)
    [switch]$InstallMissingDeps
)

$ErrorActionPreference = "Continue"
$ProgressPreference = "SilentlyContinue"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
if (-not (Test-Path (Join-Path $ProjectRoot "package.json"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot
. (Join-Path $PSScriptRoot "port-utils.ps1")
. (Join-Path $PSScriptRoot "models-path.config.ps1")

$ConfigFile = Join-Path $PSScriptRoot "apps-hosts.config.ps1"
if (Test-Path $ConfigFile) { . $ConfigFile }

# Cache Hugging Face — Stability Matrix (Forge diffusers)
if (-not (Set-IaHomeModelsEnv -Quiet)) {
    Write-Host "[ERREUR] Stability Matrix introuvable. Installez Stability Matrix ou verifiez scripts\models-path.config.ps1" -ForegroundColor Red
    exit 1
}
$ModelsCachePath = Get-IaHomeModelsCachePath
$env:NO_PROXY = "localhost,127.0.0.1,::1"
$env:no_proxy = $env:NO_PROXY

$PhotomakerPath  = if ($PhotomakerPath)  { $PhotomakerPath }  else { Join-Path $ProjectRoot "gradio-apps\photomaker" }
$AnimagineXLPath = if ($AnimagineXLPath) { $AnimagineXLPath } else { Join-Path $ProjectRoot "gradio-apps\animagine-xl" }
$Florence2Path   = if ($Florence2Path)   { $Florence2Path }   else { Join-Path $ProjectRoot "gradio-apps\florence-2" }
$BirefnetPath    = if ($BirefnetPath)    { $BirefnetPath }    else { Join-Path $ProjectRoot "gradio-apps\birefnet" }
$MuseTalkPath    = if ($MuseTalkPath)    { $MuseTalkPath }    else { Join-Path $ProjectRoot "gradio-apps\musetalk" }

$PortPhotomaker  = 7881
$PortAnimagineXL = 7883
$PortFlorence2   = 7884
$PortBirefnet    = 7882
$PortMuseTalk    = 7886

function Start-PythonWithGradioEnv {
    param(
        [string]$Name,
        [string]$Path,
        [int]$Port,
        [string]$ScriptArgs = "app.py"
    )
    $pythonExe = "python"
    $venvPython = Join-Path $Path ".venv\Scripts\python.exe"
    if (Test-Path -LiteralPath $venvPython) { $pythonExe = $venvPython }
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
    $psi = [System.Diagnostics.ProcessStartInfo]::new()
    $psi.FileName = $pythonExe
    $psi.Arguments = $ScriptArgs
    $psi.WorkingDirectory = $Path
    $psi.UseShellExecute = $false
    $psi.CreateNoWindow = $false
    foreach ($de in [System.Environment]::GetEnvironmentVariables().GetEnumerator()) {
        $k = [string]$de.Key
        $v = [string]$de.Value
        try {
            if ($psi.EnvironmentVariables.ContainsKey($k)) { $psi.EnvironmentVariables[$k] = $v }
            else { $null = $psi.EnvironmentVariables.Add($k, $v) }
        } catch { }
    }
    foreach ($key in $envToSet.Keys) {
        $v = [string]$envToSet[$key]
        if ($psi.EnvironmentVariables.ContainsKey($key)) { $psi.EnvironmentVariables[$key] = $v }
        else { $null = $psi.EnvironmentVariables.Add($key, $v) }
    }
    return [System.Diagnostics.Process]::Start($psi)
}

function Test-PythonModule {
    param([string]$PythonExe, [string]$ImportName)
    if (-not (Test-Path -LiteralPath $PythonExe)) { return $false }
    if ($ImportName -notmatch '^[A-Za-z_][A-Za-z0-9_]*$') { return $false }
    $null = & $PythonExe -c "import importlib; importlib.import_module('$ImportName')" 2>&1
    return $LASTEXITCODE -eq 0
}

function Ensure-AppDependencies {
    param([string]$Path, [string]$Name, [string]$PythonExe, [string]$PipExe)
    if (-not (Test-PythonModule -PythonExe $PythonExe -ImportName "spaces")) {
        if ($InstallMissingDeps) {
            Write-Host "  [INFO] Installation de spaces (Gradio)..." -ForegroundColor DarkGray
            $null = & $PipExe install spaces -q --disable-pip-version-check 2>&1
        } else {
            Write-Host "  [AVERT] le package 'spaces' manque peut-etre. Utilisez -InstallMissingDeps si besoin." -ForegroundColor DarkGray
        }
    }
    if ($Name -eq "Florence-2" -and -not (Test-PythonModule -PythonExe $PythonExe -ImportName "matplotlib")) {
        if ($InstallMissingDeps) {
            Write-Host "  [INFO] Installation de matplotlib (Florence-2)..." -ForegroundColor DarkGray
            $null = & $PipExe install matplotlib -q --disable-pip-version-check 2>&1
        } else {
            Write-Host "  [AVERT] matplotlib manquant. Utilisez -InstallMissingDeps ou: pip install matplotlib" -ForegroundColor Yellow
        }
    }
}

function Start-IAApp {
    param([string]$Name, [string]$Path, [int]$Port, [string]$ExtraPyArgs = "")
    if (-not $Path -or -not (Test-Path -LiteralPath $Path)) {
        Write-Host "  [SKIP] $Name : dossier introuvable ($Path)" -ForegroundColor DarkGray
        return
    }
    $appPy = Join-Path $Path "app.py"
    if (-not (Test-Path -LiteralPath $appPy)) {
        Write-Host "  [SKIP] $Name : app.py introuvable" -ForegroundColor DarkGray
        return
    }
    if (Test-PortInUse -Port $Port) {
        Write-Host "  [OK]   $Name : deja en cours (port $Port)" -ForegroundColor Green
        return
    }
    $pythonExe = "python"
    $venvPython = Join-Path $Path ".venv\Scripts\python.exe"
    if (Test-Path -LiteralPath $venvPython) { $pythonExe = $venvPython }
    $pipExe = Join-Path $Path ".venv\Scripts\pip.exe"
    if (Test-Path -LiteralPath $pipExe) {
        Ensure-AppDependencies -Path $Path -Name $Name -PythonExe $pythonExe -PipExe $pipExe
    }
    $argLine = "app.py"
    if ($ExtraPyArgs -and $ExtraPyArgs.Trim().Length -gt 0) { $argLine = "app.py $($ExtraPyArgs.Trim())" }
    try {
        $p = Start-PythonWithGradioEnv -Name $Name -Path $Path -Port $Port -ScriptArgs $argLine
        Write-Host "  [OK]   $Name demarre (port $Port, PID $($p.Id))" -ForegroundColor Green
    } catch {
        Write-Host "  [ERREUR] $Name : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  Demarrage des apps IA" -ForegroundColor Cyan
Write-Host "  Cache modeles: $ModelsCachePath" -ForegroundColor Gray
if (-not $InstallMissingDeps) {
    Write-Host "  (install pip: ajoutez -InstallMissingDeps si un module manque)" -ForegroundColor DarkGray
}
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "1. PhotoMaker :$PortPhotomaker ..." -ForegroundColor Yellow
Start-IAApp -Name "PhotoMaker" -Path $PhotomakerPath -Port $PortPhotomaker

Write-Host "`n2. Animagine XL :$PortAnimagineXL ..." -ForegroundColor Yellow
Start-IAApp -Name "Animagine XL" -Path $AnimagineXLPath -Port $PortAnimagineXL

Write-Host "`n3. Florence-2 :$PortFlorence2 ..." -ForegroundColor Yellow
Start-IAApp -Name "Florence-2" -Path $Florence2Path -Port $PortFlorence2

Write-Host "`n4. BiRefNet :$PortBirefnet ..." -ForegroundColor Yellow
Start-IAApp -Name "BiRefNet" -Path $BirefnetPath -Port $PortBirefnet

Write-Host "`n5. MuseTalk :$PortMuseTalk ..." -ForegroundColor Yellow
Start-IAApp -Name "MuseTalk" -Path $MuseTalkPath -Port $PortMuseTalk -ExtraPyArgs "--port $PortMuseTalk --ip 0.0.0.0 --use_float16"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  URLs :" -ForegroundColor White
Write-Host "    PhotoMaker    : http://localhost:$PortPhotomaker" -ForegroundColor Gray
Write-Host "    Animagine XL  : http://localhost:$PortAnimagineXL" -ForegroundColor Gray
Write-Host "    Florence-2   : http://localhost:$PortFlorence2" -ForegroundColor Gray
Write-Host "    BiRefNet     : http://localhost:$PortBirefnet" -ForegroundColor Gray
Write-Host "    MuseTalk     : http://localhost:$PortMuseTalk" -ForegroundColor Gray
Write-Host "========================================`n" -ForegroundColor Cyan
