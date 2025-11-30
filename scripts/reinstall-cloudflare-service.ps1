# Script pour réinstaller le service Cloudflare Tunnel avec un nouveau token
# Utilisez ce script si le tunnel est "hors service" dans Cloudflare Dashboard

param(
    [Parameter(Mandatory=$false)]
    [string]$Token
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Réinstallation du Service Cloudflare Tunnel        ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ Ce script doit être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "`nPour exécuter :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell → Exécuter en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "2. Exécuter : .\scripts\reinstall-cloudflare-service.ps1" -ForegroundColor Gray
    exit 1
}

# Si aucun token fourni, demander à l'utilisateur
if (-not $Token) {
    Write-Host "`n📋 Instructions pour obtenir le token :" -ForegroundColor Cyan
    Write-Host "1. Allez sur : https://one.dash.cloudflare.com/" -ForegroundColor White
    Write-Host "2. Zero Trust → Networks → Tunnels → iahome-new" -ForegroundColor White
    Write-Host "3. Cliquez sur 'Reinstall connector' ou 'Install connector'" -ForegroundColor White
    Write-Host "4. Copiez le token fourni" -ForegroundColor White
    Write-Host ""
    $Token = Read-Host "Collez le token ici"
    
    if ([string]::IsNullOrWhiteSpace($Token)) {
        Write-Host "`n❌ Token requis pour continuer" -ForegroundColor Red
        exit 1
    }
}

Write-Host "`n🛑 Arrêt du service actuel..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    Stop-Service cloudflared -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Service arrêté" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Service non trouvé (déjà désinstallé ?)" -ForegroundColor Cyan
}

Write-Host "`n🗑️  Désinstallation de l'ancien service..." -ForegroundColor Yellow
try {
    sc.exe delete cloudflared 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Service désinstallé" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur lors de la désinstallation (peut être normal si déjà désinstallé)" -ForegroundColor Yellow
}

Write-Host "`n🔧 Installation du nouveau service avec le token..." -ForegroundColor Yellow
try {
    $cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
    if (-not (Test-Path $cloudflaredPath)) {
        Write-Host "   ❌ cloudflared.exe non trouvé à : $cloudflaredPath" -ForegroundColor Red
        Write-Host "   💡 Téléchargez cloudflared depuis : https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/" -ForegroundColor Yellow
        exit 1
    }
    
    $installCommand = "& `"$cloudflaredPath`" service install `"$Token`""
    Invoke-Expression $installCommand
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service installé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n▶️  Démarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Service cloudflared -ErrorAction Stop
    Start-Sleep -Seconds 5
    $service = Get-Service cloudflared
    Write-Host "   ✅ Service démarré - Statut : $($service.Status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host "`n⏳ Attente de 30 secondes pour la connexion..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "`n📊 Vérification finale..." -ForegroundColor Cyan
$service = Get-Service cloudflared
$processes = Get-Process cloudflared -ErrorAction SilentlyContinue

Write-Host "   Service : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
Write-Host "   Processus : $(if ($processes) { "$($processes.Count) actif(s)" } else { "Aucun" })" -ForegroundColor $(if ($processes) {'Green'} else {'Yellow'})

Write-Host "`n✅ Réinstallation terminée !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Attendez 2-3 minutes" -ForegroundColor White
Write-Host "   2. Vérifiez dans Cloudflare Dashboard :" -ForegroundColor White
Write-Host "      https://one.dash.cloudflare.com/" -ForegroundColor Gray
Write-Host "      Zero Trust → Networks → Tunnels → iahome-new" -ForegroundColor Gray
Write-Host "   3. Le statut devrait passer de 'Inactive' à 'Healthy'" -ForegroundColor White
Write-Host ""






