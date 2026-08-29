# Migre les modeles iahome/models-cache vers Stability Matrix (Forge diffusers),
# puis supprime iahome/models-cache si -DeleteOldCache.
#
# Usage :
#   .\scripts\migrate-models-to-stabilitymatrix.ps1              # deplacement seulement
#   .\scripts\migrate-models-to-stabilitymatrix.ps1 -DeleteOldCache
#   .\scripts\migrate-models-to-stabilitymatrix.ps1 -WhatIf

param(
    [switch]$DeleteOldCache,
    [switch]$WhatIf
)

$ErrorActionPreference = "Stop"
. (Join-Path $PSScriptRoot "models-path.config.ps1")

$ProjectRoot = Split-Path -Parent $PSScriptRoot
$OldCache = Join-Path $ProjectRoot "models-cache"
$DestHub = $Script:SmDiffusersHub

if (-not (Test-Path -LiteralPath $DestHub)) {
    Write-Host "[ERREUR] Dossier Stability Matrix introuvable : $DestHub" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path -LiteralPath $OldCache)) {
    Write-Host "[OK] Aucun models-cache iahome a migrer." -ForegroundColor Green
    exit 0
}

function Move-ModelFolder {
    param(
        [string]$Source,
        [string]$Dest,
        [string]$Label
    )
    if (-not (Test-Path -LiteralPath $Source)) {
        Write-Host "  [SKIP] $Label : source absente" -ForegroundColor DarkGray
        return
    }
    if (Test-Path -LiteralPath $Dest) {
        Write-Host "  [SKIP] $Label : deja present dans Stability Matrix" -ForegroundColor Yellow
        return
    }
    $destParent = Split-Path -Parent $Dest
    if (-not (Test-Path -LiteralPath $destParent)) {
        if ($WhatIf) {
            Write-Host "  [WHATIF] New-Item $destParent" -ForegroundColor Cyan
        } else {
            New-Item -ItemType Directory -Path $destParent -Force | Out-Null
        }
    }
    if ($WhatIf) {
        Write-Host "  [WHATIF] Move $Source -> $Dest" -ForegroundColor Cyan
        return
    }
    Move-Item -LiteralPath $Source -Destination $Dest
    Write-Host "  [OK]   $Label" -ForegroundColor Green
}

Write-Host "`n=== Migration models-cache -> Stability Matrix ===" -ForegroundColor Cyan
Write-Host "Source : $OldCache" -ForegroundColor Gray
Write-Host "Cible  : $DestHub`n" -ForegroundColor Gray

# Modeles absents de SM Forge — a deplacer depuis iahome
$toMove = @(
    @{
        Source = Join-Path $OldCache "models--ResembleAI--chatterbox-turbo"
        Dest   = Join-Path $DestHub "models--ResembleAI--chatterbox-turbo"
        Label  = "Chatterbox turbo (MuseTalk)"
    },
    @{
        Source = Join-Path $OldCache "hub\models--TencentARC--PhotoMaker"
        Dest   = Join-Path $DestHub "models--TencentARC--PhotoMaker"
        Label  = "PhotoMaker v1 adapter"
    },
    @{
        Source = Join-Path $OldCache "hub\models--zhengpeng7--BiRefNet"
        Dest   = Join-Path $DestHub "models--zhengpeng7--BiRefNet"
        Label  = "BiRefNet General"
    },
    @{
        Source = Join-Path $OldCache "hub\models--zhengpeng7--BiRefNet_lite"
        Dest   = Join-Path $DestHub "models--zhengpeng7--BiRefNet_lite"
        Label  = "BiRefNet Lite"
    },
    @{
        Source = Join-Path $OldCache "transformers\models--microsoft--Florence-2-large-ft"
        Dest   = Join-Path $DestHub "models--microsoft--Florence-2-large-ft"
        Label  = "Florence-2-large-ft"
    },
    @{
        Source = Join-Path $OldCache "transformers\models--microsoft--Florence-2-base-ft"
        Dest   = Join-Path $DestHub "models--microsoft--Florence-2-base-ft"
        Label  = "Florence-2-base-ft"
    }
)

foreach ($item in $toMove) {
    Move-ModelFolder -Source $item.Source -Dest $item.Dest -Label $item.Label
}

# Florence large/base : deplacer seulement si SM ne les a pas encore (sinon doublon)
$optionalMove = @(
    @{
        Source = Join-Path $OldCache "transformers\models--microsoft--Florence-2-large"
        Dest   = Join-Path $DestHub "models--microsoft--Florence-2-large"
        Label  = "Florence-2-large (iahome)"
    },
    @{
        Source = Join-Path $OldCache "transformers\models--microsoft--Florence-2-base"
        Dest   = Join-Path $DestHub "models--microsoft--Florence-2-base"
        Label  = "Florence-2-base (iahome)"
    }
)
foreach ($item in $optionalMove) {
    if (-not (Test-Path -LiteralPath $item.Dest)) {
        Move-ModelFolder -Source $item.Source -Dest $item.Dest -Label $item.Label
    } else {
        Write-Host "  [SKIP] $($item.Label) : deja dans Stability Matrix" -ForegroundColor DarkGray
    }
}

Write-Host "`nModeles deja dans Stability Matrix (non deplaces) :" -ForegroundColor Gray
Write-Host "  - RealVisXL V4.0, Animagine XL 3.1, Florence-2-large/base, BiRefNet_HR, PhotoMaker-V2" -ForegroundColor DarkGray

if ($DeleteOldCache) {
    if ($WhatIf) {
        Write-Host "`n[WHATIF] Suppression de $OldCache" -ForegroundColor Cyan
    } elseif (Test-Path -LiteralPath $OldCache) {
        $remaining = (Get-ChildItem -LiteralPath $OldCache -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum
        $remainingGb = [math]::Round($remaining / 1GB, 2)
        Write-Host "`nSuppression de iahome/models-cache ($remainingGb Go restants, dont RealVisXL V3 doublon)..." -ForegroundColor Yellow
        Remove-Item -LiteralPath $OldCache -Recurse -Force
        Write-Host "[OK] models-cache supprime." -ForegroundColor Green
    }
} else {
    Write-Host "`nPour supprimer l'ancien cache : .\scripts\migrate-models-to-stabilitymatrix.ps1 -DeleteOldCache" -ForegroundColor DarkGray
}

Write-Host "`nRedemarrez les apps Gradio : .\scripts\start-ia-apps.ps1 -Restart" -ForegroundColor Cyan
