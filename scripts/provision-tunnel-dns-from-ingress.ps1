# Cree les enregistrements DNS CNAME manquants pour les hostnames du tunnel (cloudflare-active-config.yml).
# Usage : .\scripts\provision-tunnel-dns-from-ingress.ps1
#         .\scripts\provision-tunnel-dns-from-ingress.ps1 -Hostname portainerpc.regispailler.fr

param(
  [string[]]$Hostname
)

$ErrorActionPreference = 'Stop'
$ScriptDir = $PSScriptRoot
$Root = Split-Path -Parent $ScriptDir
. (Join-Path $ScriptDir 'cloudflare-dns-utils.ps1')

$envFile = Join-Path $Root '.env.production.local'
if (-not (Test-Path $envFile)) { $envFile = Join-Path $Root 'env.production.local' }

function Get-EnvValue([string]$name) {
  $line = Get-Content $envFile | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -replace "^$name=", '').Trim()
}

$token = Get-EnvValue 'CLOUDFLARE_API_TOKEN'
if (-not $token) {
  Write-Host 'CLOUDFLARE_API_TOKEN absent dans .env.production.local' -ForegroundColor Red
  Write-CloudflareDnsTokenHelp
  exit 1
}

if ($Hostname -and $Hostname.Count -gt 0) {
  $names = $Hostname
} else {
  $configPath = Join-Path $Root 'cloudflare-active-config.yml'
  if (-not (Test-Path $configPath)) { throw "Config introuvable: $configPath" }
  $lines = Get-Content $configPath
  $names = @()
  foreach ($line in $lines) {
    if ($line -match '^\s*-\s*hostname:\s*(\S+)') {
      $names += $Matches[1]
    }
  }
}

$stats = Sync-TunnelIngressDnsFromHostnames -Token $token -Hostnames $names
Write-Host ''
Write-Host "Resume : $($stats.Created) crees, $($stats.Existing) existants, $($stats.Failed) echecs, $($stats.Skipped) ignores." -ForegroundColor Cyan

if ($stats.Failed -gt 0 -or $stats.AuthFailed) {
  Write-CloudflareDnsTokenHelp
  exit 1
}
exit 0
