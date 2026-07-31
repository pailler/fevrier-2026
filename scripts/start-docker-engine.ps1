#requires -Version 5.1
<#
.SYNOPSIS
  Démarre le moteur Docker sans ouvrir l'interface Docker Desktop.
.DESCRIPTION
  1. Démarre le service Windows com.docker.service (backend Docker Desktop)
  2. Attend que le daemon réponde (docker info)
  3. Lance les stacks docker compose (prod iahome + TTS)
  Nécessite une exécution en administrateur.
.EXAMPLE
  .\scripts\start-docker-engine.ps1
.EXAMPLE
  .\scripts\start-docker-engine.ps1 -SkipCompose
#>
param(
    [switch]$SkipCompose
)

$ErrorActionPreference = "Stop"

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
    [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
    Write-Host "Elevation administrateur requise..." -ForegroundColor Yellow
    $scriptPath = $MyInvocation.MyCommand.Path
    $argList = "-ExecutionPolicy Bypass -NoProfile -File `"$scriptPath`""
    if ($SkipCompose) { $argList += " -SkipCompose" }
    Start-Process powershell -Verb RunAs -ArgumentList $argList
    exit 0
}

$ProjectRoot = Split-Path -Parent $PSScriptRoot
Set-Location $ProjectRoot

function Wait-DockerDaemon {
    param([int]$MaxSeconds = 120)
    for ($i = 1; $i -le $MaxSeconds; $i++) {
        cmd /c "docker info >nul 2>&1"
        if ($LASTEXITCODE -eq 0) { return $true }
        Start-Sleep -Seconds 1
    }
    return $false
}

Write-Host "`n=== Moteur Docker (sans GUI) ===" -ForegroundColor Cyan

# Fermer uniquement la fenêtre GUI, pas le backend
Get-Process -Name "Docker Desktop" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Démarrer le service backend (sans lancer Docker Desktop.exe)
$svc = Get-Service -Name "com.docker.service" -ErrorAction SilentlyContinue
if (-not $svc) {
    Write-Host "Service com.docker.service introuvable. Installez Docker Desktop." -ForegroundColor Red
    exit 1
}

if ($svc.Status -ne "Running") {
    Write-Host "Demarrage com.docker.service..." -ForegroundColor Yellow
    Start-Service -Name "com.docker.service"
    Start-Sleep -Seconds 2
}

# Backend Docker (moteur) sans fenetre Docker Desktop
$backendExe = "C:\Program Files\Docker\Docker\resources\com.docker.backend.exe"
if (Test-Path $backendExe) {
    $backend = Get-Process -Name "com.docker.backend" -ErrorAction SilentlyContinue
    if (-not $backend) {
        Write-Host "Demarrage com.docker.backend.exe (headless)..." -ForegroundColor Yellow
        Start-Process -FilePath $backendExe -WindowStyle Hidden
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "Backend introuvable: $backendExe" -ForegroundColor Red
    exit 1
}

if (-not (Wait-DockerDaemon)) {
    Write-Host "Le daemon Docker ne repond pas." -ForegroundColor Red
    Write-Host "Verifiez: Get-Service com.docker.service" -ForegroundColor Gray
    docker info 2>&1 | Select-Object -First 5
    exit 1
}

Write-Host "Docker daemon OK" -ForegroundColor Green
docker version --format "Server {{.Server.Version}}" 2>&1

if ($SkipCompose) { exit 0 }

docker network create iahome-network 2>$null | Out-Null

Write-Host "`nStack iahome (docker-compose.prod.yml)..." -ForegroundColor Cyan
docker compose -f docker-compose.prod.yml up -d 2>&1 | Select-Object -Last 6

Write-Host "`nTTS (port 8101)..." -ForegroundColor Cyan
Push-Location (Join-Path $ProjectRoot "tts-service")
docker compose up -d 2>&1 | Select-Object -Last 4
Pop-Location

Write-Host "`nConteneurs:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}" | Select-Object -First 25

Write-Host "`nTermine (sans Docker Desktop GUI)." -ForegroundColor Green
