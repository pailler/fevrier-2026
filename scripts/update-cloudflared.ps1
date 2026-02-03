# Mise a jour de cloudflared - evite "Acces refuse" en arretant le service/processus avant
# A executer en tant qu'Administrateur (sinon le script se relance avec elevation)

$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$configPath = Join-Path (Split-Path -Parent (Split-Path -Parent $PSScriptRoot)) "cloudflare-active-config.yml"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "Mise a jour de cloudflared necessite les droits administrateur." -ForegroundColor Yellow
    Write-Host "Relance du script avec elevation (acceptez la fenetre UAC)..." -ForegroundColor Cyan
    Write-Host ""
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$scriptPath`"" -Verb RunAs
    exit
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Mise a jour cloudflared               " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "ERREUR: cloudflared non trouve a $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

# 1. Arreter le service Windows cloudflared
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
$serviceWasRunning = $service -and ($service.Status -eq 'Running')
if ($service) {
    Write-Host "1. Arret du service cloudflared..." -ForegroundColor Yellow
    if ($serviceWasRunning) {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    Write-Host "   OK" -ForegroundColor Green
} else {
    Write-Host "1. Pas de service cloudflared installe" -ForegroundColor Gray
}

# 2. Arreter tous les processus cloudflared
Write-Host "2. Arret des processus cloudflared..." -ForegroundColor Yellow
$procs = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($procs) {
    $procs | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   OK (processus arretes)" -ForegroundColor Green
} else {
    Write-Host "   OK (aucun processus en cours)" -ForegroundColor Green
}

# 3. Lancer la mise a jour
Write-Host "3. Lancement de la mise a jour..." -ForegroundColor Yellow
& $cloudflaredPath update
$updateOk = $LASTEXITCODE -eq 0

if ($updateOk) {
    Write-Host "   OK: cloudflared mis a jour" -ForegroundColor Green
} else {
    Write-Host "   ATTENTION: la mise a jour a peut-etre echoue (code $LASTEXITCODE)" -ForegroundColor Yellow
}

# 4. Redemarrer le service si on l'avait arrete
if ($service -and $serviceWasRunning) {
    Write-Host "4. Redemarrage du service cloudflared..." -ForegroundColor Yellow
    Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    $s = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($s -and $s.Status -eq 'Running') {
        Write-Host "   OK: service demarre" -ForegroundColor Green
    } else {
        Write-Host "   Demarrez manuellement: Start-Service cloudflared" -ForegroundColor Yellow
    }
} elseif (-not $service) {
    Write-Host "4. Pour demarrer le tunnel manuellement:" -ForegroundColor Gray
    Write-Host "   cloudflared tunnel --config `"$configPath`" run" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Termine." -ForegroundColor Cyan
Write-Host ""
