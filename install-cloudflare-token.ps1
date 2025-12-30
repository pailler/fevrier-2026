# Script pour installer Cloudflare avec le token
# Demande automatiquement les droits administrateur

$token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMDJhOTYwYzUtZWRkNi00YjNmLTg0NGYtNDEwYjE2MjQ3MjYyIiwicyI6InNuNXBuSm5qUnVTaXF5TVdRNXJWdGlZQXFqbkh2Z05sY1U4dWloV2tWMFE9In0="
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "Demande des droits administrateur..." -ForegroundColor Yellow
    Write-Host "Une fenetre UAC va s'ouvrir, acceptez pour continuer." -ForegroundColor Cyan
    Write-Host ""
    
    # Relancer le script avec elevation
    $scriptPath = $MyInvocation.MyCommand.Path
    Start-Process powershell -ArgumentList "-ExecutionPolicy Bypass -NoExit -File `"$scriptPath`"" -Verb RunAs
    exit
}

# Si on arrive ici, on a les droits administrateur
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Installation Cloudflare Service      " -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "ERREUR: cloudflared.exe non trouve a : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "1. Arret de l'ancien service (si existe)..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
    }
    sc.exe delete cloudflared 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}
Write-Host "   OK" -ForegroundColor Green

Write-Host ""
Write-Host "2. Arret des processus cloudflared..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2
Write-Host "   OK" -ForegroundColor Green

Write-Host ""
Write-Host "3. Installation du service avec le token..." -ForegroundColor Yellow
Write-Host "   Token : $($token.Substring(0, 50))..." -ForegroundColor Gray

try {
    $result = & $cloudflaredPath service install $token 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   OK: Service installe avec succes" -ForegroundColor Green
    } else {
        Write-Host "   ERREUR: Code de sortie $LASTEXITCODE" -ForegroundColor Red
        Write-Host "   Sortie : $result" -ForegroundColor Yellow
        pause
        exit 1
    }
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "4. Configuration du demarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   OK: Demarrage automatique configure" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "5. Demarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 3
    $service = Get-Service -Name "cloudflared"
    Write-Host "   OK: Service demarre - Statut : $($service.Status)" -ForegroundColor Green
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  Installation terminee avec succes !  " -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue

Write-Host "Statut du service : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Yellow'})
Write-Host "Processus actifs : $(if ($processes) { $processes.Count } else { 0 })" -ForegroundColor $(if ($processes) {'Green'} else {'Yellow'})

Write-Host ""
Write-Host "Prochaines etapes :" -ForegroundColor Cyan
Write-Host "   1. Attendez 2-3 minutes pour que le tunnel se connecte" -ForegroundColor White
Write-Host "   2. Verifiez dans Cloudflare Dashboard :" -ForegroundColor White
Write-Host "      https://one.dash.cloudflare.com/9ba4294aa787e67c335c71876c10af21/networks/connectors" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")








