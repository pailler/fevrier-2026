# Synchronise l'ingress Zero Trust du tunnel iahome-new depuis cloudflare-active-config.yml
# Remplace toute la liste Public Hostnames par le fichier local (source de verite).

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $root 'cloudflare-active-config.yml'
$envFile = Join-Path $root '.env.production.local'
if (-not (Test-Path $envFile)) { $envFile = Join-Path $root '.env.production' }

function Get-EnvValue([string]$name) {
  $line = Get-Content $envFile | Where-Object { $_ -match "^$name=" } | Select-Object -First 1
  if (-not $line) { return $null }
  return ($line -replace "^$name=", '').Trim()
}

function Parse-IngressFromYaml([string]$yamlPath) {
  $lines = Get-Content $yamlPath
  $ingress = New-Object System.Collections.Generic.List[object]
  $current = $null
  $inOrigin = $false

  foreach ($line in $lines) {
    if ($line -match '^\s*ingress:\s*$') { continue }
    if ($line -notmatch '^\s*-\s' -and $current -eq $null -and $line -notmatch '^\s+\w') { continue }
    if ($line -match '^\s*-\s*hostname:\s*(\S+)') {
      if ($null -ne $current) { [void]$ingress.Add($current) }
      $current = [ordered]@{ hostname = $Matches[1] }
      $inOrigin = $false
      continue
    }
    if ($line -match '^\s*-\s*service:\s*(\S.+)') {
      if ($null -ne $current) { [void]$ingress.Add($current) }
      $current = [ordered]@{ service = $Matches[1].Trim() }
      $inOrigin = $false
      continue
    }
    if ($null -eq $current) { continue }
    if ($line -match '^\s*service:\s*(\S.+)') {
      $current.service = $Matches[1].Trim()
      continue
    }
    if ($line -match '^\s*originRequest:\s*$') {
      if (-not $current.originRequest) { $current.originRequest = [ordered]@{} }
      $inOrigin = $true
      continue
    }
    if ($inOrigin -and $line -match '^\s*(\w+):\s*(.+)$') {
      $key = $Matches[1]
      $val = $Matches[2].Trim()
      if ($val -eq 'true') { $val = $true }
      elseif ($val -eq 'false') { $val = $false }
      $current.originRequest[$key] = $val
      continue
    }
    if ($line -match '^\s*-\s' -or ($line -match '^\S' -and $line -notmatch '^\s')) {
      $inOrigin = $false
    }
  }
  if ($null -ne $current) { [void]$ingress.Add($current) }

  if ($ingress.Count -eq 0) { throw "Aucune regle ingress parsee dans $yamlPath" }
  return ,@($ingress.ToArray())
}

$token = Get-EnvValue 'CLOUDFLARE_API_TOKEN'
$accountId = Get-EnvValue 'CLOUDFLARE_ACCOUNT_ID'
if (-not $accountId) { $accountId = '9ba4294aa787e67c335c71876c10af21' }
$tunnelId = '02a960c5-edd6-4b3f-844f-410b16247262'

if (-not (Test-Path $configPath)) { throw "Config introuvable: $configPath" }
if (-not $token) {
  Write-Host 'CLOUDFLARE_API_TOKEN absent - ajoutez-le dans .env.production.local' -ForegroundColor Red
  Write-Host "Dashboard : https://one.dash.cloudflare.com/$accountId/networks/tunnels" -ForegroundColor Cyan
  exit 1
}

function ConvertTo-ApiIngressRule($rule) {
  $obj = [ordered]@{ service = [string]$rule.service }
  if ($rule.hostname) { $obj.hostname = [string]$rule.hostname }
  if ($rule.originRequest -and $rule.originRequest.Count -gt 0) {
    $origin = [ordered]@{}
    foreach ($entry in $rule.originRequest.GetEnumerator()) {
      $val = $entry.Value
      if ($val -is [string] -and $val -match '^(\d+)s$') {
        $val = [int]$Matches[1]
      }
      $origin[$entry.Key] = $val
    }
    $obj.originRequest = $origin
  }
  return [pscustomobject]$obj
}

$ingressRules = Parse-IngressFromYaml -yamlPath $configPath
$apiRules = @($ingressRules | ForEach-Object { ConvertTo-ApiIngressRule $_ })
Write-Host "Ingress parse : $($apiRules.Count) rules depuis cloudflare-active-config.yml" -ForegroundColor Cyan

$headers = @{ Authorization = "Bearer $token"; 'Content-Type' = 'application/json' }
$configUri = "https://api.cloudflare.com/client/v4/accounts/$accountId/cfd_tunnel/$tunnelId/configurations"
$bodyObj = @{ config = @{ ingress = $apiRules } }
$body = $bodyObj | ConvertTo-Json -Depth 12

try {
  $put = Invoke-RestMethod -Uri $configUri -Headers $headers -Method Put -Body $body
} catch {
  $resp = $_.Exception.Response
  if ($resp) {
    $reader = New-Object System.IO.StreamReader($resp.GetResponseStream())
    $detail = $reader.ReadToEnd()
    Write-Host "Erreur API Cloudflare ($([int]$resp.StatusCode)): $detail" -ForegroundColor Red
  }
  throw
}
if (-not $put.success) {
  throw "PUT config failed: $($put.errors | ConvertTo-Json -Compress)"
}

Write-Host "OK - Zero Trust ingress synchronise ($($apiRules.Count) rules)." -ForegroundColor Green
$landing = @('code-learning.iahome.fr', 'photobooth.iahome.fr', 'psitransfer.iahome.fr', 'www.psitransfer.iahome.fr', 'metube.iahome.fr', 'www.metube.iahome.fr')
foreach ($h in $landing) {
  $rule = $apiRules | Where-Object { $_.hostname -eq $h } | Select-Object -First 1
  if ($rule) {
    Write-Host "  $h -> $($rule.service)" -ForegroundColor Gray
  }
}

# DNS CNAME pour hostnames du tunnel (iahome.fr + regispailler.fr)
. (Join-Path $PSScriptRoot 'cloudflare-dns-utils.ps1')
$hostnames = @($apiRules | Where-Object { $_.hostname } | ForEach-Object { $_.hostname })
Write-Host ''
$dnsStats = Sync-TunnelIngressDnsFromHostnames -Token $token -Hostnames $hostnames -TunnelId $tunnelId
Write-Host "DNS : $($dnsStats.Created) crees, $($dnsStats.Existing) existants, $($dnsStats.Failed) echecs." -ForegroundColor $(if ($dnsStats.Failed -gt 0) { 'Yellow' } else { 'Green' })
if ($dnsStats.Failed -gt 0 -or $dnsStats.AuthFailed) {
  Write-Host 'Ingress OK — DNS non provisionne (mettre a jour le token, puis relancer provision-tunnel-dns-from-ingress.ps1).' -ForegroundColor Yellow
}
