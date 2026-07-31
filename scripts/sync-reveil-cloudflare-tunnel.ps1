# Resynchronise le tunnel Cloudflare avec cloudflare-active-config.yml (inclut reveil-intelligent → :7891)
# Exécuter en administrateur : clic droit > Exécuter avec PowerShell (admin)

$ErrorActionPreference = 'Stop'

$cloudflaredPath = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
$configPath = Join-Path (Split-Path -Parent $PSScriptRoot) 'cloudflare-active-config.yml'

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
if ($config -notmatch 'reveil-intelligent\.iahome\.fr' -or $config -notmatch '7891') {
  Write-Host 'reveil-intelligent.iahome.fr → :7891 absent du YAML' -ForegroundColor Red
  exit 1
}

Write-Host '1. Arrêt du service cloudflared...' -ForegroundColor Cyan
Stop-Service cloudflared -Force -ErrorAction SilentlyContinue
Get-Process cloudflared -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host '2. Réinstallation du service avec cloudflare-active-config.yml...' -ForegroundColor Cyan
& $cloudflaredPath service uninstall 2>$null
Start-Sleep -Seconds 1
& $cloudflaredPath --config $configPath service install
if ($LASTEXITCODE -ne 0) {
  Write-Host "Échec service install (code $LASTEXITCODE)" -ForegroundColor Red
  exit $LASTEXITCODE
}

Write-Host '3. Démarrage du service...' -ForegroundColor Cyan
Start-Service cloudflared
Start-Sleep -Seconds 6

$svc = Get-Service cloudflared -ErrorAction SilentlyContinue
if (-not $svc -or $svc.Status -ne 'Running') {
  Write-Host 'Le service cloudflared ne tourne pas.' -ForegroundColor Red
  exit 1
}

Write-Host '4. Tests locaux et publics...' -ForegroundColor Cyan
try {
  $local = Invoke-WebRequest -Uri 'http://127.0.0.1:7891/' -UseBasicParsing -TimeoutSec 5
  Write-Host "   OK local :7891 → HTTP $($local.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "   ERREUR local :7891 — $($_.Exception.Message)" -ForegroundColor Red
  Write-Host '   Lancez : docker compose -f docker-compose.prod.yml up -d reveil-intelligent' -ForegroundColor Yellow
}

Start-Sleep -Seconds 3
try {
  $public = Invoke-WebRequest -Uri 'https://reveil-intelligent.iahome.fr/' -UseBasicParsing -TimeoutSec 20
  Write-Host "   OK public reveil-intelligent → HTTP $($public.StatusCode)" -ForegroundColor Green
} catch {
  Write-Host "   ERREUR public — $($_.Exception.Message)" -ForegroundColor Red
  Write-Host '   Vérifiez Zero Trust > Networks > Tunnels > Public Hostnames si le 502 persiste.' -ForegroundColor Yellow
}

Write-Host 'Terminé.' -ForegroundColor Green
