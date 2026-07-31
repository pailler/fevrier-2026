# Expose minecraft.iahome.fr via Cloudflare Tunnel (TCP -> localhost:25565)
# Executer en administrateur : clic droit > Executer avec PowerShell (admin)

$ErrorActionPreference = 'Stop'

$cloudflaredPath = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'cloudflare-active-config.yml'
$tunnelName = 'iahome-new'
$hostname = 'minecraft.iahome.fr'

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)

if (-not $isAdmin) {
  Write-Host 'Relance avec droits administrateur (UAC)...' -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$PSCommandPath`"" -Verb RunAs
  exit
}

if (-not (Test-Path $cloudflaredPath)) {
  Write-Host "cloudflared introuvable : $cloudflaredPath" -ForegroundColor Red
  exit 1
}

if (-not (Test-Path $configPath)) {
  Write-Host "Config introuvable : $configPath" -ForegroundColor Red
  exit 1
}

$config = Get-Content $configPath -Raw
if ($config -notmatch 'minecraft\.iahome\.fr' -or $config -notmatch 'tcp://localhost:25565') {
  Write-Host 'minecraft.iahome.fr -> tcp://localhost:25565 absent du YAML' -ForegroundColor Red
  exit 1
}

Write-Host '1. Verification du serveur Minecraft local...' -ForegroundColor Cyan
$mcPort = Get-NetTCPConnection -LocalPort 25565 -State Listen -ErrorAction SilentlyContinue
if (-not $mcPort) {
  Write-Host '   ATTENTION : rien n ecoute sur le port 25565' -ForegroundColor Yellow
  Write-Host '   Demarrez le serveur : C:\Users\AAA\Documents\minecraft\start-server.bat' -ForegroundColor Yellow
} else {
  Write-Host "   OK port 25565 (PID $($mcPort.OwningProcess))" -ForegroundColor Green
}

Write-Host '2. Route DNS tunnel...' -ForegroundColor Cyan
& $cloudflaredPath --config $configPath tunnel route dns $tunnelName $hostname --overwrite-dns 2>&1
if ($LASTEXITCODE -ne 0) {
  Write-Host '   Route DNS via CLI echouee — ajoutez manuellement un CNAME minecraft -> tunnel dans Cloudflare DNS' -ForegroundColor Yellow
}

Write-Host '3. Arret du service cloudflared...' -ForegroundColor Cyan
Stop-Service cloudflared -Force -ErrorAction SilentlyContinue
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host '4. Reinstallation du service avec cloudflare-active-config.yml...' -ForegroundColor Cyan
& $cloudflaredPath service uninstall 2>$null
Start-Sleep -Seconds 1
& $cloudflaredPath --config $configPath service install
if ($LASTEXITCODE -ne 0) {
  Write-Host "Echec service install (code $LASTEXITCODE)" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host '5. Demarrage du service...' -ForegroundColor Cyan
Start-Service cloudflared
Start-Sleep -Seconds 6

$svc = Get-Service cloudflared -ErrorAction SilentlyContinue
if (-not $svc -or $svc.Status -ne 'Running') {
  Write-Host 'Le service cloudflared ne tourne pas.' -ForegroundColor Red
  exit 1
}

Write-Host '6. Verification DNS...' -ForegroundColor Cyan
try {
  Resolve-DnsName $hostname -ErrorAction Stop | Select-Object -First 3 | Format-Table Name, Type, TTL -AutoSize
} catch {
  Write-Host "   DNS pas encore resolu pour $hostname" -ForegroundColor Yellow
}

Write-Host ''
Write-Host 'Termine.' -ForegroundColor Green
Write-Host "Connexion externe : $hostname (port 25565 par defaut)" -ForegroundColor Cyan
Write-Host 'Version client requise : Minecraft Java 1.21.7' -ForegroundColor Gray
