# Installation manuelle du service avec verification de chaque etape
# Methode la plus fiable

$ErrorActionPreference = "Continue"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script necessite les droits administrateur" -ForegroundColor Red
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION MANUELLE DU SERVICE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"
$configFullPath = (Resolve-Path $configPath).Path

# Verifier cloudflared
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "[ERREUR] cloudflared non trouve" -ForegroundColor Red
    exit 1
}

$cloudflaredExe = $cloudflared.Source
Write-Host "[OK] cloudflared: $cloudflaredExe" -ForegroundColor Green

# Nettoyer l'ancien service
Write-Host "`n[1/5] Nettoyage de l'ancien service..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
    sc delete cloudflared 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}
Write-Host "   [OK] Nettoyage termine" -ForegroundColor Green

# Creer le service avec sc.exe - methode la plus fiable
Write-Host "`n[2/5] Creation du service avec sc.exe..." -ForegroundColor Yellow

# Le chemin du binaire doit etre entre guillemets, et les arguments aussi
$binPath = "`"$cloudflaredExe`" tunnel run --config `"$configFullPath`""

Write-Host "   Commande: sc create cloudflared binPath= $binPath start= auto" -ForegroundColor Gray

$result = sc create cloudflared binPath= $binPath start= auto 2>&1

if ($LASTEXITCODE -eq 0 -or $result -like "*SUCCESS*" -or $result -like "*cree*") {
    Write-Host "   [OK] Service cree" -ForegroundColor Green
    Write-Host "   Sortie: $result" -ForegroundColor Gray
} else {
    Write-Host "   [ERREUR] Echec de la creation" -ForegroundColor Red
    Write-Host "   Sortie: $result" -ForegroundColor Red
    Write-Host "   Code: $LASTEXITCODE" -ForegroundColor Red
    
    # Tentative avec echappement different
    Write-Host "`n   [TENTATIVE] Methode alternative..." -ForegroundColor Yellow
    $binPathAlt = "$cloudflaredExe tunnel run --config $configFullPath"
    $result2 = sc create cloudflared binPath= `"$binPathAlt`" start= auto 2>&1
    
    if ($LASTEXITCODE -eq 0 -or $result2 -like "*SUCCESS*") {
        Write-Host "   [OK] Service cree avec methode alternative" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] Echec aussi avec methode alternative" -ForegroundColor Red
        Write-Host "   Sortie: $result2" -ForegroundColor Red
        exit 1
    }
}

Start-Sleep -Seconds 3

# Verifier que le service existe
Write-Host "`n[3/5] Verification du service..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "   [OK] Service trouve!" -ForegroundColor Green
    Write-Host "   Nom: $($service.Name)" -ForegroundColor White
    Write-Host "   Statut: $($service.Status)" -ForegroundColor White
} else {
    Write-Host "   [ERREUR] Service non trouve apres creation" -ForegroundColor Red
    Write-Host "   Verifiez avec: sc query cloudflared" -ForegroundColor Yellow
    exit 1
}

# Configurer le demarrage automatique
Write-Host "`n[4/5] Configuration du demarrage automatique..." -ForegroundColor Yellow
Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction SilentlyContinue
sc config cloudflared start= auto 2>&1 | Out-Null
Write-Host "   [OK] Demarrage automatique configure" -ForegroundColor Green

# Demarrer le service
Write-Host "`n[5/5] Demarrage du service..." -ForegroundColor Yellow
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    
    $service = Get-Service -Name "cloudflared"
    if ($service.Status -eq 'Running') {
        Write-Host "   [OK] Service demarre avec succes!" -ForegroundColor Green
    } else {
        Write-Host "   [AVERTISSEMENT] Service non demarre. Statut: $($service.Status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   [ERREUR] Impossible de demarrer: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION TERMINEE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Statut: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Yellow'})
    Write-Host "Demarrage: $($service.StartType)" -ForegroundColor White
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














