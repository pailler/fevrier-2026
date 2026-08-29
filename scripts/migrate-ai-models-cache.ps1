# Migre iahome/ai-models-cache vers Stability Matrix, puis supprime l'ancien dossier.
#
# Usage :
#   .\scripts\migrate-ai-models-cache.ps1
#   .\scripts\migrate-ai-models-cache.ps1 -DeleteOldCache
#   .\scripts\migrate-ai-models-cache.ps1 -WhatIf

param(
    [switch]$DeleteOldCache,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "models-path.config.ps1")

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OldCache = Join-Path $ProjectRoot "ai-models-cache"
$DestHub = $Script:SmDiffusersHub
$DestCoqui = $Script:SmServicesCoqui
$DestTorch = $Script:SmServicesTorch

if (-not (Test-Path -LiteralPath $OldCache)) {
    Write-Host "[OK] Aucun ai-models-cache iahome a migrer." -ForegroundColor Green
    exit 0
}

function Ensure-Dir([string]$Path) {
    if (-not (Test-Path -LiteralPath $Path)) {
        if ($WhatIf) { Write-Host "  [WHATIF] New-Item $Path" -ForegroundColor Cyan }
        else { New-Item -ItemType Directory -Path $Path -Force | Out-Null }
    }
}

function Move-Tree {
    param([string]$Source, [string]$Dest, [string]$Label)
    if (-not (Test-Path -LiteralPath $Source)) {
        Write-Host "  [SKIP] $Label : source absente" -ForegroundColor DarkGray
        return
    }
    if (Test-Path -LiteralPath $Dest) {
        Write-Host "  [SKIP] $Label : deja present" -ForegroundColor Yellow
        return
    }
    $parent = Split-Path -Parent $Dest
    Ensure-Dir $parent
    if ($WhatIf) {
        Write-Host "  [WHATIF] Move $Source -> $Dest" -ForegroundColor Cyan
        return
    }
    Move-Item -LiteralPath $Source -Destination $Dest
    Write-Host "  [OK]   $Label" -ForegroundColor Green
}

function Move-TreeContents {
    param([string]$Source, [string]$Dest, [string]$Label)
    if (-not (Test-Path -LiteralPath $Source)) {
        Write-Host "  [SKIP] $Label : source absente" -ForegroundColor DarkGray
        return
    }
    Ensure-Dir $Dest
    Get-ChildItem -LiteralPath $Source -Force | ForEach-Object {
        $target = Join-Path $Dest $_.Name
        if (Test-Path -LiteralPath $target) {
            Write-Host "  [SKIP] $($_.Name) : deja present dans $Label" -ForegroundColor DarkGray
        } elseif ($WhatIf) {
            Write-Host "  [WHATIF] Move $($_.FullName) -> $target" -ForegroundColor Cyan
        } else {
            Move-Item -LiteralPath $_.FullName -Destination $target
        }
    }
    if (-not $WhatIf) { Write-Host "  [OK]   $Label" -ForegroundColor Green }
}

Write-Host "`n=== Migration ai-models-cache -> Stability Matrix ===" -ForegroundColor Cyan
Write-Host "Source : $OldCache" -ForegroundColor Gray

Ensure-Dir $Script:SmIaHomeServicesCache
Ensure-Dir $DestCoqui
Ensure-Dir $DestTorch

# Stable Diffusion v1.5 -> cache HF Forge (partage avec apps Gradio)
Move-Tree `
    -Source (Join-Path $OldCache "huggingface\models--runwayml--stable-diffusion-v1-5") `
    -Dest (Join-Path $DestHub "models--runwayml--stable-diffusion-v1-5") `
    -Label "Stable Diffusion v1.5 (photo-animation)"

# Coqui XTTS
Move-TreeContents -Source (Join-Path $OldCache "coqui") -Dest $DestCoqui -Label "Coqui TTS (XTTS v2)"

# Torch hub (voice isolation)
Move-TreeContents -Source (Join-Path $OldCache "torch") -Dest $DestTorch -Label "Torch hub (voice isolation)"

if ($DeleteOldCache) {
    if ($WhatIf) {
        Write-Host "`n[WHATIF] Suppression de $OldCache" -ForegroundColor Cyan
    } elseif (Test-Path -LiteralPath $OldCache) {
        $remaining = (Get-ChildItem -LiteralPath $OldCache -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        Write-Host "`nSuppression de ai-models-cache ($([math]::Round($remaining/1GB,2)) Go restants)..." -ForegroundColor Yellow
        Remove-Item -LiteralPath $OldCache -Recurse -Force
        Write-Host "[OK] ai-models-cache supprime." -ForegroundColor Green
    }
} else {
    Write-Host "`nPour supprimer l'ancien cache : .\scripts\migrate-ai-models-cache.ps1 -DeleteOldCache" -ForegroundColor DarkGray
}

Write-Host "`nCaches cibles :" -ForegroundColor Gray
Write-Host "  HF/Diffusers : $DestHub" -ForegroundColor DarkGray
Write-Host "  Coqui TTS    : $DestCoqui" -ForegroundColor DarkGray
Write-Host "  Torch        : $DestTorch" -ForegroundColor DarkGray
