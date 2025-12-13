# Installation manuelle du service Cloudflare
# DOIT etre execute en tant qu'administrateur

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  INSTALLATION MANUELLE DU SERVICE CLOUDFLARE" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host ""
    Write-Host "ERREUR: Ce script DOIT etre execute en tant qu'administrateur" -ForegroundColor Red
    exit 1
}

# Chemins
$cloudflaredPath = 'C:\Program Files (x86)\cloudflared\cloudflared.exe'
$configPath = 'C:\Users\AAA\Documents\iahome\cloudflare-active-config.yml'

# Verifications
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host ""
    Write-Host "ERREUR: cloudflared.exe non trouve a : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path $configPath)) {
    Write-Host ""
    Write-Host "ERREUR: Fichier de configuration non trouve : $configPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "OK: cloudflared trouve : $cloudflaredPath" -ForegroundColor Green
Write-Host "OK: Configuration trouvee : $configPath" -ForegroundColor Green

# Arret des processus existants
Write-Host ""
Write-Host "Arret des processus existants..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "   OK: Processus arretes" -ForegroundColor Green
}

# Desinstallation de l'ancien service si existe
Write-Host ""
Write-Host "Desinstallation de l'ancien service..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    try {
        & $cloudflaredPath service uninstall 2>&1 | Out-Null
        Start-Sleep -Seconds 2
        Write-Host "   OK: Ancien service desinstalle" -ForegroundColor Green
    } catch {
        Write-Host "   ATTENTION: Erreur lors de la desinstallation" -ForegroundColor Yellow
    }
} else {
    Write-Host "   OK: Aucun service existant" -ForegroundColor Green
}

# Installation du service avec la syntaxe exacte
Write-Host ""
Write-Host "Installation du service..." -ForegroundColor Yellow
Write-Host "   Commande: & '$cloudflaredPath' service install --config '$configPath'" -ForegroundColor Gray

try {
    # Utiliser la syntaxe exacte suggeree
    $result = & $cloudflaredPath service install --config $configPath 2>&1
    
    # Attendre que le service soit cree
    Start-Sleep -Seconds 5
    
    # Verifier si le service existe
    $serviceCheck = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    
    if ($serviceCheck) {
        Write-Host "   OK: Service installe avec succes!" -ForegroundColor Green
        Write-Host "   Statut: $($serviceCheck.Status)" -ForegroundColor Gray
    } else {
        Write-Host "   ATTENTION: Commande executee mais service non trouve" -ForegroundColor Yellow
        Write-Host "   Sortie: $result" -ForegroundColor Gray
        Write-Host ""
        Write-Host "   Tentative avec attente supplementaire..." -ForegroundColor Yellow
        Start-Sleep -Seconds 10
        $serviceCheck = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($serviceCheck) {
            Write-Host "   OK: Service maintenant trouve!" -ForegroundColor Green
        } else {
            Write-Host "   ERREUR: Service toujours non trouve" -ForegroundColor Red
            Write-Host ""
            Write-Host "   Le service peut necessiter un redemarrage de l'ordinateur" -ForegroundColor Yellow
            Write-Host "   ou il y a un probleme avec cloudflared.exe" -ForegroundColor Yellow
            pause
            exit 1
        }
    }
} catch {
    Write-Host "   ERREUR: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Type: $($_.Exception.GetType().FullName)" -ForegroundColor Yellow
    pause
    exit 1
}

# Configuration du demarrage automatique
Write-Host ""
Write-Host "Configuration du demarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   OK: Demarrage automatique configure" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: Erreur lors de la configuration" -ForegroundColor Yellow
}

# Demarrage du service
Write-Host ""
Write-Host "Demarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2

try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    
    $service = Get-Service -Name "cloudflared"
    if ($service.Status -eq 'Running') {
        Write-Host "   OK: Service demarre avec succes!" -ForegroundColor Green
    } else {
        Write-Host "   ATTENTION: Service installe mais statut: $($service.Status)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ERREUR: Impossible de demarrer le service" -ForegroundColor Red
    Write-Host "   Message: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Le service est installe mais ne peut pas demarrer." -ForegroundColor Yellow
    Write-Host "   Verifiez les logs: Get-EventLog -LogName Application -Source cloudflared -Newest 10" -ForegroundColor Gray
}

# Verification finale
Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue

if ($service) {
    $serviceStatus = $service.Status
    Write-Host "   Service: $serviceStatus" -ForegroundColor $(if ($serviceStatus -eq 'Running') {'Green'} else {'Red'})
}

if ($processes) {
    $processCount = $processes.Count
    Write-Host "   Processus: $processCount actif(s)" -ForegroundColor Green
} else {
    Write-Host "   Processus: Aucun" -ForegroundColor Yellow
}

if ($service -and $service.Status -eq 'Running' -and $processes) {
    Write-Host ""
    Write-Host "SUCCES: SERVICE CLOUDFLARE INSTALLE ET DEMARRE!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "ATTENTION: Le service peut necessiter un redemarrage de l'ordinateur" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

