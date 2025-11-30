# Script de monitoring et auto-réparation de Cloudflare Tunnel

Write-Host "🔍 MONITORING CLOUDFLARE TUNNEL" -ForegroundColor Cyan
Write-Host "==============================`n" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

$maxRetries = 3
$retryDelay = 10

function Test-CloudflareDomain {
    param([string]$Domain)
    try {
        $response = Invoke-WebRequest -Uri $Domain -Method Head -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        return @{ Success = $true; StatusCode = $response.StatusCode }
    } catch {
        $statusCode = $null
        try {
            $statusCode = $_.Exception.Response.StatusCode.value__
        } catch {}
        return @{ Success = $false; StatusCode = $statusCode; Error = $_.Exception.Message }
    }
}

function Restart-CloudflareTunnel {
    Write-Host "`n🔄 Redémarrage de Cloudflare Tunnel..." -ForegroundColor Yellow
    
    # Arrêter tous les processus
    Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 5
    
    # Redémarrer
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$scriptDir'; cloudflared tunnel --config cloudflare-active-config.yml run" -WindowStyle Minimized
    Start-Sleep -Seconds 20
    
    $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    return $processes -ne $null
}

# Test des domaines
Write-Host "1️⃣ Test de connectivité..." -ForegroundColor Yellow
$domains = @("https://iahome.fr", "https://qrcodes.iahome.fr", "https://librespeed.iahome.fr", "https://whisper.iahome.fr")
$failedDomains = @()

foreach ($domain in $domains) {
    $result = Test-CloudflareDomain -Domain $domain
    if ($result.Success) {
        Write-Host "   ✅ $domain : HTTP $($result.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $domain : Erreur" -ForegroundColor Red
        if ($result.StatusCode -eq 1033 -or $result.Error -like "*1033*") {
            Write-Host "      ⚠️  Erreur 1033 détectée!" -ForegroundColor Red
            $failedDomains += $domain
        }
    }
}

# Si des erreurs 1033 sont détectées, redémarrer
if ($failedDomains.Count -gt 0) {
    Write-Host "`n⚠️  Erreurs 1033 détectées sur $($failedDomains.Count) domaine(s)" -ForegroundColor Red
    Write-Host "   Tentative de réparation..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le $maxRetries; $i++) {
        Write-Host "`n   Tentative $i/$maxRetries..." -ForegroundColor Gray
        
        if (Restart-CloudflareTunnel) {
            Write-Host "   ✅ Tunnel redémarré" -ForegroundColor Green
            Start-Sleep -Seconds $retryDelay
            
            # Retester
            $allOk = $true
            foreach ($domain in $failedDomains) {
                $result = Test-CloudflareDomain -Domain $domain
                if (-not $result.Success) {
                    $allOk = $false
                    Write-Host "   ⚠️  $domain : Toujours en erreur" -ForegroundColor Yellow
                } else {
                    Write-Host "   ✅ $domain : Réparé (HTTP $($result.StatusCode))" -ForegroundColor Green
                }
            }
            
            if ($allOk) {
                Write-Host "`n✅ Tous les domaines sont maintenant accessibles!" -ForegroundColor Green
                break
            }
        } else {
            Write-Host "   ❌ Échec du redémarrage" -ForegroundColor Red
        }
        
        if ($i -lt $maxRetries) {
            Start-Sleep -Seconds $retryDelay
        }
    }
} else {
    Write-Host "`n✅ Tous les domaines sont accessibles!" -ForegroundColor Green
}

# État final
Write-Host "`n📊 ÉTAT FINAL:" -ForegroundColor Cyan
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   ✅ Cloudflare Tunnel actif (PID: $($processes.Id -join ', '))" -ForegroundColor Green
} else {
    Write-Host "   ❌ Cloudflare Tunnel non démarré" -ForegroundColor Red
}

Write-Host ""

