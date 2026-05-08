<#
.SYNOPSIS
    Utilitaires de port sans Get-NetTCPConnection.
.NOTES
    Get-NetTCPConnection -LocalPort peut rester bloque plusieurs minutes sur certains
    systemes Windows (WSL, Hyper-V, beaucoup de sessions). On utilise netstat.
#>

function Test-PortInUse {
    param([int]$Port)
    if ($Port -lt 1 -or $Port -gt 65535) { return $false }
    $lines = netstat -ano 2>$null
    if (-not $lines) { return $false }
    foreach ($line in $lines) {
        # Windows EN: LISTENING ; sortie localisee possible (ECOUTE, etc.)
        if ($line -notmatch 'LISTENING|ECOUTE') { continue }
        $rx = ":{0}\s+.*(LISTENING|ECOUTE)" -f $Port
        if ($line -match $rx) { return $true }
    }
    return $false
}

function Get-ListeningPidsOnPort {
    param([int]$Port)
    if ($Port -lt 1 -or $Port -gt 65535) { return @() }
    $pids = [System.Collections.Generic.HashSet[int]]::new()
    $lines = netstat -ano 2>$null
    foreach ($line in $lines) {
        if ($line -notmatch 'LISTENING|ECOUTE') { continue }
        if ($line -notmatch (":{0}\s+" -f $Port)) { continue }
        if ($line -match "\s+(\d+)\s*$") {
            $n = 0
            if ([int]::TryParse($matches[1], [ref]$n) -and $n -gt 0) {
                [void]$pids.Add($n)
            }
        }
    }
    return @($pids)
}

function Stop-ListenersOnPort {
    param(
        [int]$Port,
        [switch]$Quiet
    )
    $ids = Get-ListeningPidsOnPort -Port $Port
    foreach ($id in $ids) {
        if (-not $Quiet) {
            Write-Host "  Arret processus PID $id (port $Port)..." -ForegroundColor Yellow
        }
        try {
            Stop-Process -Id $id -Force -ErrorAction SilentlyContinue
        } catch { /* pass */ }
    }
    if ($ids.Count) {
        Start-Sleep -Milliseconds 500
    }
    return $ids.Count
}
