# Script d'installation avec debug detaille pour identifier les problemes

$ErrorActionPreference = "Continue"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script necessite les droits administrateur" -ForegroundColor Red
    Write-Host "Relance avec elevation des droits..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs
    exit
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION CLOUDFLARE - MODE DEBUG" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"

# ETAPE 1: Verification de cloudflared
Write-Host "[1/6] Verification de cloudflared..." -ForegroundColor Yellow
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "   [ERREUR] cloudflared non trouve dans le PATH" -ForegroundColor Red
    
    # Chercher dans les emplacements communs
    $commonPaths = @(
        "C:\Program Files (x86)\cloudflared\cloudflared.exe",
        "C:\Program Files\cloudflared\cloudflared.exe",
        "$env:USERPROFILE\AppData\Local\cloudflared\cloudflared.exe"
    )
    
    foreach ($path in $commonPaths) {
        if (Test-Path $path) {
            Write-Host "   [TROUVE] cloudflared trouve a: $path" -ForegroundColor Green
            $env:Path += ";$(Split-Path $path -Parent)"
            $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
            break
        }
    }
    
    if (-not $cloudflared) {
        Write-Host "   [ERREUR] cloudflared introuvable" -ForegroundColor Red
        Write-Host "   Telechargez depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
        exit 1
    }
}

Write-Host "   [OK] cloudflared: $($cloudflared.Source)" -ForegroundColor Green

# Test de la version
Write-Host "   Test de la version..." -ForegroundColor Gray
$versionOutput = & $cloudflared.Source --version 2>&1
Write-Host "   $versionOutput" -ForegroundColor Gray

# ETAPE 2: Verification de la configuration
Write-Host "`n[2/6] Verification de la configuration..." -ForegroundColor Yellow
if (-not (Test-Path $configPath)) {
    Write-Host "   [ERREUR] Configuration introuvable: $configPath" -ForegroundColor Red
    exit 1
}

Write-Host "   [OK] Configuration: $configPath" -ForegroundColor Green
$configFullPath = (Resolve-Path $configPath).Path
Write-Host "   Chemin complet: $configFullPath" -ForegroundColor Gray

# Verifier le contenu de la configuration
$configContent = Get-Content $configPath -Raw
if ($configContent -match "tunnel:\s*(\S+)") {
    $tunnelName = $matches[1]
    Write-Host "   Tunnel: $tunnelName" -ForegroundColor Gray
} else {
    Write-Host "   [AVERTISSEMENT] Tunnel non trouve dans la configuration" -ForegroundColor Yellow
}

# ETAPE 3: Verification des credentials
Write-Host "`n[3/6] Verification des credentials..." -ForegroundColor Yellow
$credentialsPath = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"
if (Test-Path $credentialsPath) {
    Write-Host "   [OK] Credentials trouves" -ForegroundColor Green
} else {
    Write-Host "   [ERREUR] Credentials introuvables: $credentialsPath" -ForegroundColor Red
    exit 1
}

# ETAPE 4: Desinstallation de l'ancien service
Write-Host "`n[4/6] Desinstallation de l'ancien service..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "   Service existant trouve, desinstallation..." -ForegroundColor Gray
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
    
    $uninstallOutput = & $cloudflared.Source service uninstall 2>&1
    Write-Host "   Sortie: $uninstallOutput" -ForegroundColor Gray
    Start-Sleep -Seconds 3
    
    # Verifier avec sc delete aussi
    sc delete cloudflared 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}

Write-Host "   [OK] Ancien service desinstalle" -ForegroundColor Green

# ETAPE 5: Installation avec debug detaille
Write-Host "`n[5/6] Installation du service avec debug detaille..." -ForegroundColor Yellow
Write-Host "   Commande: cloudflared service install --config `"$configFullPath`"" -ForegroundColor Gray

try {
    # Capturer TOUTE la sortie
    $installOutput = & $cloudflared.Source service install --config $configFullPath 2>&1
    
    Write-Host "   Sortie complete:" -ForegroundColor Gray
    $installOutput | ForEach-Object {
        Write-Host "   $_" -ForegroundColor White
    }
    
    Write-Host "   Code de retour: $LASTEXITCODE" -ForegroundColor $(if ($LASTEXITCODE -eq 0) {'Green'} else {'Red'})
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERREUR] Installation echouee avec le code: $LASTEXITCODE" -ForegroundColor Red
        
        # Tentative alternative: installation avec le chemin complet de cloudflared
        Write-Host "`n   [TENTATIVE] Installation alternative avec chemin complet..." -ForegroundColor Yellow
        $cloudflaredExe = $cloudflared.Source
        $altOutput = & $cloudflaredExe service install --config $configFullPath 2>&1
        Write-Host "   Sortie alternative:" -ForegroundColor Gray
        $altOutput | ForEach-Object {
            Write-Host "   $_" -ForegroundColor White
        }
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   [ERREUR] Installation alternative aussi echouee" -ForegroundColor Red
            Write-Host "`n   [DIAGNOSTIC] Verifiez:" -ForegroundColor Yellow
            Write-Host "   1. Que cloudflared est bien installe" -ForegroundColor Gray
            Write-Host "   2. Que le fichier de configuration est valide" -ForegroundColor Gray
            Write-Host "   3. Que les credentials sont valides" -ForegroundColor Gray
            Write-Host "   4. Les logs Windows Event Viewer" -ForegroundColor Gray
            exit 1
        }
    }
    
    Start-Sleep -Seconds 5
    
} catch {
    Write-Host "   [ERREUR] Exception lors de l'installation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Type: $($_.Exception.GetType().FullName)" -ForegroundColor Gray
    Write-Host "   StackTrace: $($_.Exception.StackTrace)" -ForegroundColor Gray
    exit 1
}

# ETAPE 6: Verification de l'installation
Write-Host "`n[6/6] Verification de l'installation..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "   [OK] Service installe avec succes!" -ForegroundColor Green
    Write-Host "   Nom: $($service.Name)" -ForegroundColor White
    Write-Host "   Statut: $($service.Status)" -ForegroundColor White
    Write-Host "   Type de demarrage: $($service.StartType)" -ForegroundColor White
    
    # Configurer le demarrage automatique
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction SilentlyContinue
    
    # Demarrer le service
    if ($service.Status -ne 'Running') {
        Write-Host "`n   Demarrage du service..." -ForegroundColor Yellow
        Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
        
        $service = Get-Service -Name "cloudflared"
        if ($service.Status -eq 'Running') {
            Write-Host "   [OK] Service demarre" -ForegroundColor Green
        } else {
            Write-Host "   [AVERTISSEMENT] Service non demarre. Statut: $($service.Status)" -ForegroundColor Yellow
        }
    }
    
    Write-Host "`n========================================" -ForegroundColor Green
    Write-Host "  INSTALLATION REUSSIE" -ForegroundColor Green
    Write-Host "========================================`n" -ForegroundColor Green
    
} else {
    Write-Host "   [ERREUR] Service non trouve apres installation" -ForegroundColor Red
    Write-Host "`n   [DIAGNOSTIC] Verifiez:" -ForegroundColor Yellow
    Write-Host "   1. Les logs Windows Event Viewer (Application)" -ForegroundColor Gray
    Write-Host "   2. Que cloudflared peut creer des services Windows" -ForegroundColor Gray
    Write-Host "   3. Executez: sc query cloudflared" -ForegroundColor Gray
    Write-Host "   4. Executez: cloudflared service install --help" -ForegroundColor Gray
    
    # Verifier si le service existe mais avec un autre nom
    $allServices = Get-Service | Where-Object { $_.Name -like "*cloudflare*" }
    if ($allServices) {
        Write-Host "`n   Services Cloudflare trouves:" -ForegroundColor Yellow
        $allServices | ForEach-Object {
            Write-Host "   - $($_.Name): $($_.Status)" -ForegroundColor White
        }
    }
    
    exit 1
}

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














