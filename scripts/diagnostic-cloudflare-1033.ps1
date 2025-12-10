# Script de diagnostic complet pour l'erreur 1033 Cloudflare Tunnel

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC ERREUR 1033 CLOUDFLARE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"
$credentialsPath = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"

# 1. Verification des fichiers
Write-Host "[1] Verification des fichiers..." -ForegroundColor Yellow
if (Test-Path $configPath) {
    Write-Host "   [OK] Configuration: $configPath" -ForegroundColor Green
    $configContent = Get-Content $configPath -Raw
    if ($configContent -match "tunnel:\s*(\S+)") {
        $tunnelName = $matches[1]
        Write-Host "   [OK] Tunnel: $tunnelName" -ForegroundColor Green
    }
} else {
    Write-Host "   [ERREUR] Configuration introuvable" -ForegroundColor Red
}

if (Test-Path $credentialsPath) {
    Write-Host "   [OK] Credentials: $credentialsPath" -ForegroundColor Green
    try {
        $creds = Get-Content $credentialsPath -Raw | ConvertFrom-Json
        Write-Host "   [OK] AccountTag: $($creds.AccountTag)" -ForegroundColor Gray
        Write-Host "   [OK] TunnelID: $($creds.TunnelID)" -ForegroundColor Gray
    } catch {
        Write-Host "   [ERREUR] Credentials invalides" -ForegroundColor Red
    }
} else {
    Write-Host "   [ERREUR] Credentials introuvables" -ForegroundColor Red
}

# 2. Verification du service
Write-Host "`n[2] Verification du service Windows..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "   [OK] Service installe" -ForegroundColor Green
    Write-Host "   Statut: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Yellow'})
    Write-Host "   Demarrage: $($service.StartType)" -ForegroundColor White
    
    # Verifier la configuration du service
    $serviceConfig = sc qc cloudflared 2>&1
    if ($serviceConfig -match "BINARY_PATH_NAME") {
        Write-Host "   Configuration du service:" -ForegroundColor Gray
        Write-Host "   $serviceConfig" -ForegroundColor Gray
    }
} else {
    Write-Host "   [ERREUR] Service non installe" -ForegroundColor Red
}

# 3. Verification des processus
Write-Host "`n[3] Verification des processus..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    foreach ($proc in $processes) {
        Write-Host "   [OK] PID: $($proc.Id) - Demarrage: $($proc.StartTime)" -ForegroundColor Green
    }
} else {
    Write-Host "   [AVERTISSEMENT] Aucun processus en cours" -ForegroundColor Yellow
}

# 4. Verification des logs
Write-Host "`n[4] Verification des logs recents..." -ForegroundColor Yellow
try {
    $logs = Get-EventLog -LogName Application -Source cloudflared -Newest 10 -ErrorAction SilentlyContinue
    if ($logs) {
        Write-Host "   Derniers logs:" -ForegroundColor Gray
        foreach ($log in $logs) {
            $color = if ($log.EntryType -eq 'Error') { 'Red' } elseif ($log.EntryType -eq 'Warning') { 'Yellow' } else { 'Gray' }
            Write-Host "   [$($log.TimeGenerated)] $($log.Message)" -ForegroundColor $color
        }
    } else {
        Write-Host "   [INFO] Aucun log trouve" -ForegroundColor Gray
    }
} catch {
    Write-Host "   [AVERTISSEMENT] Impossible de lire les logs" -ForegroundColor Yellow
}

# 5. Test de connexion Cloudflare
Write-Host "`n[5] Test de connexion Cloudflare..." -ForegroundColor Yellow
try {
    $testUrl = "https://iahome.fr"
    Write-Host "   Test: $testUrl" -ForegroundColor Gray
    $response = Invoke-WebRequest -Uri $testUrl -TimeoutSec 10 -ErrorAction Stop -UseBasicParsing
    Write-Host "   [OK] HTTP $($response.StatusCode)" -ForegroundColor Green
} catch {
    $statusCode = if ($_.Exception.Response) { $_.Exception.Response.StatusCode.value__ } else { "N/A" }
    Write-Host "   [ERREUR] HTTP $statusCode - $($_.Exception.Message)" -ForegroundColor Red
    if ($statusCode -eq 1033) {
        Write-Host "   [ERREUR 1033] Probleme de configuration Cloudflare Tunnel" -ForegroundColor Red
    }
}

# 6. Recommendations
Write-Host "`n[6] Recommendations..." -ForegroundColor Yellow
if (-not $service) {
    Write-Host "   [ACTION] Installer le service:" -ForegroundColor Cyan
    Write-Host "   .\scripts\force-install-cloudflare.ps1" -ForegroundColor White
} elseif ($service.Status -ne 'Running') {
    Write-Host "   [ACTION] Demarrer le service:" -ForegroundColor Cyan
    Write-Host "   Start-Service cloudflared" -ForegroundColor White
}

Write-Host "`n   [VERIFICATION] Dans Cloudflare Dashboard:" -ForegroundColor Cyan
Write-Host "   1. Allez sur: https://one.dash.cloudflare.com/" -ForegroundColor White
Write-Host "   2. Zero Trust -> Networks -> Tunnels" -ForegroundColor White
Write-Host "   3. Verifiez que le tunnel 'iahome-new' est 'Healthy'" -ForegroundColor White
Write-Host "   4. Verifiez que les domaines sont configures dans Public Hostnames" -ForegroundColor White

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DIAGNOSTIC TERMINE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














