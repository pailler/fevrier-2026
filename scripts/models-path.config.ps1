# Chemins de cache modeles IA — structure Stability Matrix standard.
# HF / Diffusers : Data\Models\Diffusers (comme ComfyUI extra_model_paths.yaml)
# Coqui / Torch  : Data\Models\IaHome-Services-Cache\ (services Docker IAHome)

if (-not $StabilityMatrixDataRoot) {
    $StabilityMatrixDataRoot = Join-Path $env:USERPROFILE "Documents\StabilityMatrix-win-x64\Data"
}

$Script:SmDiffusersHub = Join-Path $StabilityMatrixDataRoot "Models\Diffusers"
$Script:SmIaHomeServicesCache = Join-Path $StabilityMatrixDataRoot "Models\IaHome-Services-Cache"
$Script:SmServicesCoqui = Join-Path $Script:SmIaHomeServicesCache "coqui"
$Script:SmServicesTorch = Join-Path $Script:SmIaHomeServicesCache "torch"

function Set-IaHomeModelsEnv {
    [CmdletBinding()]
    param(
        [switch]$Quiet
    )

    if (-not (Test-Path -LiteralPath $Script:SmDiffusersHub)) {
        New-Item -ItemType Directory -Path $Script:SmDiffusersHub -Force | Out-Null
    }
    if (-not (Test-Path -LiteralPath $Script:SmIaHomeServicesCache)) {
        New-Item -ItemType Directory -Path $Script:SmIaHomeServicesCache -Force | Out-Null
    }

    $env:HF_HOME = $Script:SmDiffusersHub
    $env:HF_HUB_CACHE = $Script:SmDiffusersHub
    $env:HUGGINGFACE_HUB_CACHE = $Script:SmDiffusersHub
    $env:TRANSFORMERS_CACHE = $Script:SmDiffusersHub
    $env:DIFFUSERS_CACHE = $Script:SmDiffusersHub
    $env:IAHOME_MODELS_SOURCE = "StabilityMatrix"
    $env:IAHOME_SM_DIFFUSERS = $Script:SmDiffusersHub
    $env:IAHOME_SM_HF_CACHE = $Script:SmDiffusersHub
    $env:IAHOME_SM_COQUI_CACHE = $Script:SmServicesCoqui
    $env:IAHOME_SM_TORCH_CACHE = $Script:SmServicesTorch

    $script:ModelsCachePath = $Script:SmDiffusersHub

    if (-not $Quiet) {
        Write-Host "  Cache HF/Diffusers : $Script:SmDiffusersHub (Stability Matrix)" -ForegroundColor DarkGray
    }
    return $true
}

function Get-IaHomeModelsCachePath {
    return $Script:SmDiffusersHub
}

function Get-IaHomeCoquiCachePath {
    return $Script:SmServicesCoqui
}

function Get-IaHomeTorchCachePath {
    return $Script:SmServicesTorch
}

function Get-IaHomeSmRelativePath {
    param([string]$SubPath)
    $iahomeRoot = Split-Path -Parent $PSScriptRoot
    $documentsRoot = Split-Path -Parent $iahomeRoot
    $full = Join-Path (Join-Path $documentsRoot "StabilityMatrix-win-x64\Data") $SubPath
    if (-not (Test-Path -LiteralPath $full)) {
        New-Item -ItemType Directory -Path $full -Force | Out-Null
    }
    return (Resolve-Path -LiteralPath $full).Path
}
