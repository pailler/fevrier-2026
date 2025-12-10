# Script pour installer Cloudflare Tunnel comme service Windows
# Exécuter en tant qu'administrateur

param(
    [switch]$Uninstall,
    [switch]$Status
)

$ErrorActionPreference = "Stop"

function Write-Step {
    param([string]$Message, [string]$Color = "Cyan")
    Write-Host "`n$Message" -ForegroundColor $Color
}

function Write-Success {
    param([string]$Message)
    Write-Host "✅ $Message" -ForegroundColor Green
}

function Write-Error {
    param([string]$Message)
    Write-Host "❌ $Message" -ForegroundColor Red
}

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Error "Ce script doit être exécuté en tant qu'administrateur"
    Write-Host "`nPour exécuter en tant qu'administrateur :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell" -ForegroundColor Gray
    Write-Host "2. Sélectionner 'Exécuter en tant qu'administrateur'" -ForegroundColor Gray
    Write-Host "3. Exécuter : .\install-cloudflare-service.ps1" -ForegroundColor Gray
    exit 1
}

if ($Status) {
    Write-Step "📊 Statut du service Cloudflare Tunnel" "Cyan"
    
    $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "`nService : cloudflared" -ForegroundColor Yellow
        Write-Host "   Statut : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
        Write-Host "   Type de démarrage : $($service.StartType)" -ForegroundColor White
        
        if ($service.Status -eq 'Running') {
            Write-Success "Le service est en cours d'exécution"
        } else {
            Write-Host "⚠️  Le service n'est pas démarré" -ForegroundColor Yellow
            Write-Host "   Pour démarrer : Start-Service cloudflared" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Le service cloudflared n'est pas installé" -ForegroundColor Red
    }
    
    return
}

if ($Uninstall) {
    Write-Step "🛑 Désinstallation du service Cloudflare Tunnel" "Yellow"
    
    $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($service) {
        if ($service.Status -eq 'Running') {
            Write-Host "Arrêt du service..." -ForegroundColor Yellow
            Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
            Start-Sleep -Seconds 2
        }
        
        Write-Host "Désinstallation du service..." -ForegroundColor Yellow
        cloudflared service uninstall 2>&1 | Out-Null
        
        Start-Sleep -Seconds 2
        
        $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        if (-not $service) {
            Write-Success "Service désinstallé avec succès"
        } else {
            Write-Error "Erreur lors de la désinstallation"
        }
    } else {
        Write-Host "⚠️  Le service n'est pas installé" -ForegroundColor Yellow
    }
    
    return
}

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Installation de Cloudflare Tunnel comme service    ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Vérifier si cloudflared est installé
$cloudflaredPath = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflaredPath) {
    Write-Error "cloudflared n'est pas trouvé dans le PATH"
    Write-Host "`nAssurez-vous que cloudflared est installé et accessible" -ForegroundColor Yellow
    exit 1
}

Write-Step "📋 Vérification de la configuration" "Cyan"

# Le fichier de configuration est à la racine du projet (un niveau au-dessus de scripts/)
$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"
if (-not (Test-Path $configPath)) {
    Write-Error "Le fichier cloudflare-active-config.yml n'existe pas"
    Write-Host "   Chemin attendu : $configPath" -ForegroundColor Gray
    exit 1
}

Write-Success "Configuration trouvée : $configPath"

# Vérifier si le service existe déjà
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "`n⚠️  Le service cloudflared existe déjà" -ForegroundColor Yellow
    $response = Read-Host "Voulez-vous le réinstaller ? (O/N)"
    if ($response -ne "O" -and $response -ne "o") {
        Write-Host "Installation annulée" -ForegroundColor Yellow
        exit 0
    }
    
    Write-Host "Désinstallation de l'ancien service..." -ForegroundColor Yellow
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
    }
    cloudflared service uninstall 2>&1 | Out-Null
    Start-Sleep -Seconds 2
}

# Arrêter les processus cloudflared existants
Write-Step "🛑 Arrêt des processus cloudflared existants" "Yellow"
Get-Process | Where-Object {$_.ProcessName -like "*cloudflared*"} | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

# Installer le service
Write-Step "🔧 Installation du service Cloudflare Tunnel" "Green"

try {
    # Installer le service avec le chemin de configuration
    $configFullPath = (Resolve-Path $configPath).Path
    cloudflared service install --config $configFullPath
    
    Start-Sleep -Seconds 3
    
    # Vérifier l'installation
    $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Success "Service installé avec succès"
        
        # Configurer le démarrage automatique
        Write-Step "⚙️  Configuration du démarrage automatique" "Cyan"
        Set-Service -Name "cloudflared" -StartupType Automatic
        Write-Success "Démarrage automatique configuré"
        
        # Démarrer le service
        Write-Step "🚀 Démarrage du service" "Green"
        Start-Service -Name "cloudflared"
        Start-Sleep -Seconds 5
        
        $service = Get-Service -Name "cloudflared"
        if ($service.Status -eq 'Running') {
            Write-Success "Service démarré avec succès"
        } else {
            Write-Host "⚠️  Le service n'a pas démarré automatiquement" -ForegroundColor Yellow
            Write-Host "   Statut : $($service.Status)" -ForegroundColor Gray
            Write-Host "   Pour démarrer manuellement : Start-Service cloudflared" -ForegroundColor Gray
        }
        
        Write-Host "`n📋 Informations du service :" -ForegroundColor Cyan
        Write-Host "   Nom : cloudflared" -ForegroundColor White
        Write-Host "   Configuration : $configFullPath" -ForegroundColor White
        Write-Host "   Démarrage : Automatique" -ForegroundColor White
        Write-Host "   Statut : $($service.Status)" -ForegroundColor White
        
        Write-Host "`n💡 Commandes utiles :" -ForegroundColor Cyan
        Write-Host "   - Vérifier le statut : .\install-cloudflare-service.ps1 -Status" -ForegroundColor Gray
        Write-Host "   - Démarrer : Start-Service cloudflared" -ForegroundColor Gray
        Write-Host "   - Arrêter : Stop-Service cloudflared" -ForegroundColor Gray
        Write-Host "   - Redémarrer : Restart-Service cloudflared" -ForegroundColor Gray
        Write-Host "   - Désinstaller : .\install-cloudflare-service.ps1 -Uninstall" -ForegroundColor Gray
        
    } else {
        Write-Error "Erreur lors de l'installation du service"
        Write-Host "`nVérifiez les logs pour plus d'informations" -ForegroundColor Yellow
    }
} catch {
    Write-Error "Erreur lors de l'installation : $($_.Exception.Message)"
    Write-Host "`nAssurez-vous que :" -ForegroundColor Yellow
    Write-Host "   - Vous êtes administrateur" -ForegroundColor Gray
    Write-Host "   - cloudflared est installé et dans le PATH" -ForegroundColor Gray
    Write-Host "   - Le fichier cloudflare-active-config.yml existe" -ForegroundColor Gray
}

