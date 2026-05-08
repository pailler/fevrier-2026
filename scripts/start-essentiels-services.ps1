<#
.SYNOPSIS
    Demarre librespeed, qrcodes et photobooth en mode dev/prod.
.DESCRIPTION
    Lance les conteneurs Docker pour:
    - librespeed (port 8085)
    - qrcodes (port 7006)
    - photobooth (port 7885)
    - apprendre-autrement (port 9001, via docker-compose.prod.yml si present)
.EXAMPLE
    .\scripts\start-essentiels-services.ps1
#>

$ErrorActionPreference = "Continue"
$ProjectRoot = if ($PSScriptRoot) {
    $parent = Split-Path -Parent $PSScriptRoot
    if (Test-Path (Join-Path $parent "docker-compose.prod.yml")) { $parent } else { Get-Location }
} else { Get-Location }

Set-Location $ProjectRoot

# Verifier Docker
cmd /c "docker info >nul 2>&1"
if ($LASTEXITCODE -ne 0) {
    Write-Host "[X] Docker non demarre. Lancez Docker Desktop puis relancez." -ForegroundColor Red
    exit 1
}

# Creer les reseaux Docker requis par qrcodes (evite l'echec au demarrage)
$networks = @("iahome-network", "iahome_iahome-network")
foreach ($net in $networks) {
    docker network inspect $net *> $null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "  Creation du reseau $net..." -ForegroundColor Gray
        docker network create $net *> $null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] Reseau $net cree" -ForegroundColor Green
        }
    }
}

Write-Host "`nDemarrage librespeed, qrcodes, photobooth..." -ForegroundColor Cyan

# docker-services/essentiels contient librespeed et qrcodes
$essentielsPath = Join-Path $ProjectRoot "docker-services\essentiels"
$photoboothPath = Join-Path $ProjectRoot "photobooth"

$ok = $true

if (Test-Path (Join-Path $essentielsPath "docker-compose.yml")) {
    Write-Host "  librespeed + qrcodes..." -ForegroundColor Gray
    Push-Location $essentielsPath
    # *> $null evite que la sortie Docker ne declenche des erreurs PowerShell
    docker compose up -d librespeed qrcodes *> $null
    $exitCode = $LASTEXITCODE
    Pop-Location
    if ($exitCode -ne 0) {
        Write-Host "  [!] Erreur librespeed/qrcodes" -ForegroundColor Yellow
        Write-Host "      Verifiez: docker compose -f docker-services/essentiels/docker-compose.yml logs qrcodes" -ForegroundColor Gray
        $ok = $false
    } else {
        Write-Host "  [OK] librespeed (localhost:8085), qrcodes (localhost:7006)" -ForegroundColor Green
    }
} else {
    Write-Host "  [!] docker-services/essentiels non trouve" -ForegroundColor Yellow
}

if (Test-Path (Join-Path $photoboothPath "docker-compose.yml")) {
    Write-Host "  photobooth..." -ForegroundColor Gray
    Push-Location $photoboothPath
    docker compose up -d photobooth *> $null
    $exitCode = $LASTEXITCODE
    Pop-Location
    if ($exitCode -ne 0) {
        Write-Host "  [!] Erreur photobooth" -ForegroundColor Yellow
        $ok = $false
    } else {
        Write-Host "  [OK] photobooth (localhost:7885)" -ForegroundColor Green
    }
} else {
    Write-Host "  [!] photobooth/ non trouve" -ForegroundColor Yellow
}

# Apprendre Autrement (Next.js) — service defini dans docker-compose.prod.yml a la racine du depot
$prodCompose = Join-Path $ProjectRoot "docker-compose.prod.yml"
if (Test-Path $prodCompose) {
    Write-Host "  apprendre-autrement (docker-compose.prod.yml)..." -ForegroundColor Gray
    Push-Location $ProjectRoot
    docker compose -f docker-compose.prod.yml up -d apprendre-autrement *> $null
    $exitAa = $LASTEXITCODE
    Pop-Location
    if ($exitAa -ne 0) {
        Write-Host "  [!] Erreur apprendre-autrement (build ou image manquant ? redeploy-prod-full.ps1)" -ForegroundColor Yellow
        $ok = $false
    } else {
        Write-Host "  [OK] apprendre-autrement (reseau Docker :9001, pas d'ecoute sur l'hote)" -ForegroundColor Green
    }
}

Write-Host ""
if ($ok) {
    Write-Host "Services demarres. URLs locales:" -ForegroundColor Green
    Write-Host "  - librespeed: http://localhost:8085" -ForegroundColor Gray
    Write-Host "  - qrcodes:    http://localhost:7006" -ForegroundColor Gray
    Write-Host "  - photobooth: http://localhost:7885" -ForegroundColor Gray
    Write-Host "  - apprendre-autrement: apprendre-autrement.iahome.fr (ou reseau Docker, pas localhost:9001)" -ForegroundColor Gray
} else {
    Write-Host "Certains services n'ont pas demarre. Verifiez les logs Docker." -ForegroundColor Yellow
}
Write-Host ""
