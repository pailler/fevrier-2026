# Restaure Cloudflare pour les applis IAHome :
# 1) Worker protect-sous-domaines (tokens / landings publiques)
# 2) Ingress Zero Trust depuis cloudflare-active-config.yml
# 3) Service cloudflared local (ImagePath + config)
# Executer en administrateur.

$ErrorActionPreference = 'Continue'
$ScriptDir = $PSScriptRoot

$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole(
  [Security.Principal.WindowsBuiltInRole]::Administrator
)
if (-not $isAdmin) {
  Write-Host 'Relance avec droits administrateur (UAC)...' -ForegroundColor Yellow
  Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$PSCommandPath`"" -Verb RunAs
  exit
}

Write-Host "`n=== Restauration Cloudflare (applis IAHome) ===`n" -ForegroundColor Cyan

Write-Host '[1/3] Worker protect-sous-domaines-iahome...' -ForegroundColor White
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ScriptDir 'deploy-protect-sous-domaines-worker.ps1')
Write-Host ''

Write-Host '[2/3] Ingress Zero Trust (cloudflare-active-config.yml)...' -ForegroundColor White
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ScriptDir 'sync-cloudflare-tunnel-ingress-from-yml.ps1')
if ($LASTEXITCODE -ne 0) {
  Write-Host 'Echec sync ingress — verifiez CLOUDFLARE_API_TOKEN' -ForegroundColor Red
}
Write-Host ''

Write-Host '[3/3] Service cloudflared local...' -ForegroundColor White
& powershell -NoProfile -ExecutionPolicy Bypass -File (Join-Path $ScriptDir 'restore-cloudflared.ps1')
Write-Host ''

Write-Host '=== Tests rapides ===' -ForegroundColor Cyan
$urls = @(
  'https://iahome.fr/',
  'https://psitransfer.iahome.fr/',
  'https://photobooth.iahome.fr/',
  'https://code-learning.iahome.fr/',
  'https://metube.iahome.fr/',
  'https://pdf.iahome.fr/',
  'https://portainerpc.regispailler.fr/'
)
foreach ($u in $urls) {
  try {
    $r = Invoke-WebRequest -Uri $u -UseBasicParsing -MaximumRedirection 0 -TimeoutSec 20 -ErrorAction Stop
    Write-Host "  OK $u -> $($r.StatusCode)" -ForegroundColor Green
  } catch {
    $code = $_.Exception.Response.StatusCode.value__
    if ($code -eq 302) {
      Write-Host "  OK $u -> 302 (redirect)" -ForegroundColor Green
    } elseif ($code -eq 502) {
      Write-Host "  502 $u (tunnel OK, service local arrete ?)" -ForegroundColor Yellow
    } else {
      Write-Host "  ? $u -> $code" -ForegroundColor Yellow
    }
  }
}

Write-Host "`nTermine. Log cloudflared : logs/cloudflared-restore.log" -ForegroundColor Green
