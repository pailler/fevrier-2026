# Script simple pour demarrer Next.js sur le port 3000

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Demarrage Next.js sur port 3000      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Changer vers le repertoire du projet
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

Write-Host "Repertoire: $RootPath" -ForegroundColor Gray
Write-Host ""

# Verifier Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERREUR: Node.js non trouve" -ForegroundColor Red
    Write-Host "Installez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Node.js: $($node.Version)" -ForegroundColor Green
Write-Host ""

# Verifier le build
$buildPath = Join-Path $RootPath ".next"
if (-not (Test-Path $buildPath)) {
    Write-Host "ATTENTION: Build non trouve. Construction de l'application..." -ForegroundColor Yellow
    Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
    npm run build
    if ($LASTEXITCODE -ne 0) {
        Write-Host "ERREUR: Echec de la construction" -ForegroundColor Red
        pause
        exit 1
    }
    Write-Host "OK: Build termine" -ForegroundColor Green
    Write-Host ""
}

# Arreter les processus existants sur le port 3000
Write-Host "Arret des processus sur le port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $proc = Get-Process -Id $port3000.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "OK: Processus arrete" -ForegroundColor Green
    }
} else {
    Write-Host "OK: Port 3000 libre" -ForegroundColor Green
}
Write-Host ""

# Demarrer Next.js
Write-Host "Demarrage de Next.js..." -ForegroundColor Yellow
Write-Host "Mode: production" -ForegroundColor Gray
Write-Host "Port: 3000" -ForegroundColor Gray
Write-Host "URL: http://localhost:3000" -ForegroundColor Gray
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT = "3000"

# Demarrer directement (affichera les erreurs dans cette fenetre)
npm start








