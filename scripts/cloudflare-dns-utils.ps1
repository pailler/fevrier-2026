# Utilitaires DNS Cloudflare pour les hostnames du tunnel iahome-new.
# Token requis (CLOUDFLARE_API_TOKEN dans .env.production.local) :
#   - Account > Cloudflare Tunnel > Edit
#   - Zone > DNS > Edit  (iahome.fr + regispailler.fr)
#   - Zone > Zone > Read (liste des zones)

$script:CloudflareTunnelId = '02a960c5-edd6-4b3f-844f-410b16247262'
$script:CloudflareZoneIds = @{
  'iahome.fr'           = '8e3782f7423cf8735c045eeabf8c6cf5'
  'regispailler.fr'     = '52f3298037007c6f6bb6097144351b40'
  'ambiancesphotos.fr' = '6eec7ea7672f5ad03ee43558284a2851'
}

function Get-CloudflareApiHeaders([string]$Token) {
  return @{
    Authorization  = "Bearer $Token"
    'Content-Type' = 'application/json'
  }
}

function Get-HostnameZone([string]$Hostname) {
  $parts = $Hostname.Split('.')
  if ($parts.Count -lt 2) { return $null }
  foreach ($depth in @(2, 3)) {
    if ($parts.Count -ge $depth) {
      $zoneName = ($parts[($parts.Count - $depth)..($parts.Count - 1)] -join '.')
      if ($script:CloudflareZoneIds.ContainsKey($zoneName)) {
        return [pscustomobject]@{
          ZoneName = $zoneName
          ZoneId   = $script:CloudflareZoneIds[$zoneName]
          RecordName = if ($parts.Count -gt $depth) {
            ($parts[0..($parts.Count - $depth - 1)] -join '.')
          } else { '@' }
        }
      }
    }
  }
  return $null
}

function Test-CloudflareDnsApiAccess {
  param(
    [string]$Token,
    [string]$ZoneId = $script:CloudflareZoneIds['regispailler.fr']
  )
  try {
    $headers = Get-CloudflareApiHeaders -Token $Token
    $uri = "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records?per_page=1"
    $r = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
    return [bool]$r.success
  } catch {
    return $false
  }
}

function Write-CloudflareDnsTokenHelp {
  $accountId = '9ba4294aa787e67c335c71876c10af21'
  Write-Host ''
  Write-Host 'Le token CLOUDFLARE_API_TOKEN doit inclure :' -ForegroundColor Yellow
  Write-Host '  - Account > Cloudflare Tunnel > Edit' -ForegroundColor Gray
  Write-Host '  - Zone > DNS > Edit (iahome.fr + regispailler.fr + ambiancesphotos.fr)' -ForegroundColor Gray
  Write-Host '  - Zone > Zone > Read' -ForegroundColor Gray
  Write-Host ''
  Write-Host "Creer / modifier le token :" -ForegroundColor Cyan
  Write-Host "  https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor White
  Write-Host "  Puis mettre a jour CLOUDFLARE_API_TOKEN dans .env.production.local" -ForegroundColor Gray
  Write-Host "  Tunnel : https://one.dash.cloudflare.com/$accountId/networks/tunnels" -ForegroundColor Gray
  Write-Host ''
}

function Get-CloudflareDnsRecord {
  param(
    [string]$Token,
    [string]$ZoneId,
    [string]$Hostname
  )
  $headers = Get-CloudflareApiHeaders -Token $Token
  $uri = "https://api.cloudflare.com/client/v4/zones/$ZoneId/dns_records?name=$Hostname"
  $r = Invoke-RestMethod -Uri $uri -Headers $headers -Method Get
  if (-not $r.success) { return $null }
  return $r.result | Select-Object -First 1
}

function Ensure-CloudflareTunnelDnsRecord {
  param(
    [Parameter(Mandatory)][string]$Token,
    [Parameter(Mandatory)][string]$Hostname,
    [string]$TunnelId = $script:CloudflareTunnelId,
    [switch]$Quiet
  )
  if ([string]::IsNullOrWhiteSpace($Hostname)) { return $false }
  if ($Hostname -match '^\*') { return $false }

  $zone = Get-HostnameZone -Hostname $Hostname
  if (-not $zone) {
    if (-not $Quiet) {
      Write-Host "  [SKIP] $Hostname : zone DNS inconnue (hors iahome.fr / regispailler.fr)" -ForegroundColor DarkGray
    }
    return $false
  }

  $existing = Get-CloudflareDnsRecord -Token $Token -ZoneId $zone.ZoneId -Hostname $Hostname
  if ($existing) {
    if (-not $Quiet) {
      Write-Host "  [OK]   $Hostname : DNS deja present ($($existing.type) -> $($existing.content))" -ForegroundColor Green
    }
    return $true
  }

  $cnameTarget = "$TunnelId.cfargotunnel.com"
  $recordName = $zone.RecordName
  if ($recordName -eq '@') { $recordName = $zone.ZoneName }

  $body = @{
    type    = 'CNAME'
    name    = if ($zone.RecordName -eq '@') { $zone.ZoneName } else { $zone.RecordName }
    content = $cnameTarget
    proxied = $true
    ttl     = 1
  } | ConvertTo-Json

  $headers = Get-CloudflareApiHeaders -Token $Token
  $postUri = "https://api.cloudflare.com/client/v4/zones/$($zone.ZoneId)/dns_records"
  try {
    $post = Invoke-RestMethod -Method Post -Uri $postUri -Headers $headers -Body $body
  } catch {
    if (-not $Quiet) {
      Write-Host "  [ERR]  $Hostname : impossible de creer le CNAME ($cnameTarget)" -ForegroundColor Red
    }
    return $false
  }

  if (-not $post.success) {
    if (-not $Quiet) {
      Write-Host "  [ERR]  $Hostname : $($post.errors | ConvertTo-Json -Compress)" -ForegroundColor Red
    }
    return $false
  }

  if (-not $Quiet) {
    Write-Host "  [NEW]  $Hostname -> $cnameTarget" -ForegroundColor Green
  }
  return $true
}

function Sync-TunnelIngressDnsFromHostnames {
  param(
    [Parameter(Mandatory)][string]$Token,
    [Parameter(Mandatory)][string[]]$Hostnames,
    [string]$TunnelId = $script:CloudflareTunnelId
  )

  if (-not (Test-CloudflareDnsApiAccess -Token $Token)) {
    Write-Host 'DNS API inaccessible (token sans permission DNS:Edit ?)' -ForegroundColor Yellow
    Write-CloudflareDnsTokenHelp
    return @{ Created = 0; Existing = 0; Failed = $Hostnames.Count; Skipped = 0; AuthFailed = $true }
  }

  $stats = @{ Created = 0; Existing = 0; Failed = 0; Skipped = 0 }
  $unique = $Hostnames | Where-Object { $_ -and $_ -notmatch '^\*' } | Sort-Object -Unique

  Write-Host "Provisionnement DNS tunnel ($($unique.Count) hostnames)..." -ForegroundColor Cyan
  foreach ($h in $unique) {
    $zone = Get-HostnameZone -Hostname $h
    if (-not $zone) {
      $stats.Skipped++
      Write-Host "  [SKIP] $h" -ForegroundColor DarkGray
      continue
    }
    $existing = Get-CloudflareDnsRecord -Token $Token -ZoneId $zone.ZoneId -Hostname $h
    if ($existing) {
      $stats.Existing++
      Write-Host "  [OK]   $h ($($existing.type))" -ForegroundColor Green
      continue
    }
    $ok = Ensure-CloudflareTunnelDnsRecord -Token $Token -Hostname $h -TunnelId $TunnelId -Quiet
    if ($ok) {
      $stats.Created++
      Write-Host "  [NEW]  $h -> $TunnelId.cfargotunnel.com" -ForegroundColor Green
    } else {
      $stats.Failed++
    }
  }
  return $stats
}
