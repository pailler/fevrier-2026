# Script pour rétablir le connecteur Cloudflare Tunnel
# DOIT être exécuté en tant qu'administrateur

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ Ce script DOIT être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "`nPour exécuter :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell → Exécuter en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "2. Naviguez vers le dossier : cd '$PSScriptRoot'" -ForegroundColor Gray
    Write-Host "3. Exécutez : .\restore-cloudflare-connector.ps1" -ForegroundColor Gray
    exit 1
}

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Rétablissement du connecteur Cloudflare Tunnel     ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
$configPath = Join-Path $PSScriptRoot "cloudflare-active-config.yml"

# Vérifier que cloudflared existe
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`n❌ cloudflared.exe non trouvé à : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

# Vérifier que la configuration existe
if (-not (Test-Path $configPath)) {
    Write-Host "`n❌ Fichier de configuration non trouvé : $configPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n✅ cloudflared trouvé : $cloudflaredPath" -ForegroundColor Green
Write-Host "✅ Configuration trouvée : $configPath" -ForegroundColor Green

# Étape 1 : Arrêt du service existant
Write-Host "`n1️⃣ Arrêt du service cloudflared..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    Write-Host "   ✅ Service arrêté" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Aucun service existant" -ForegroundColor Cyan
}

# Étape 2 : Arrêt des processus cloudflared
Write-Host "`n2️⃣ Arrêt des processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ℹ️  Aucun processus à arrêter" -ForegroundColor Cyan
}

# Étape 3 : Désinstallation du service existant (si présent)
Write-Host "`n3️⃣ Nettoyage de l'ancien service..." -ForegroundColor Yellow
if ($service) {
    try {
        & "$cloudflaredPath" service uninstall 2>&1 | Out-Null
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Ancien service désinstallé" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Erreur lors de la désinstallation : $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ℹ️  Aucun service à désinstaller" -ForegroundColor Cyan
}

# Étape 4 : Nettoyage de la clé de registre Event Logger
Write-Host "`n4️⃣ Nettoyage de la clé de registre Event Logger..." -ForegroundColor Yellow
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\EventLog\Application\Cloudflared"
if (Test-Path $regPath) {
    try {
        Remove-Item -Path $regPath -Recurse -Force -ErrorAction Stop
        Write-Host "   ✅ Clé de registre supprimée" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Tentative avec reg.exe..." -ForegroundColor Yellow
        try {
            reg.exe delete "HKLM\SYSTEM\CurrentControlSet\Services\EventLog\Application\Cloudflared" /f 2>&1 | Out-Null
            Write-Host "   ✅ Clé supprimée avec reg.exe" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Impossible de supprimer la clé (peut être ignoré)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ℹ️  Clé de registre non trouvée" -ForegroundColor Cyan
}

# Étape 5 : Attente pour s'assurer que tout est nettoyé
Write-Host "`n5️⃣ Attente de nettoyage complet..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Étape 6 : Installation du service avec le fichier de configuration
Write-Host "`n6️⃣ Installation du service avec la configuration..." -ForegroundColor Yellow
$configFullPath = (Resolve-Path $configPath).Path
Write-Host "   Configuration : $configFullPath" -ForegroundColor Gray

try {
    $result = & "$cloudflaredPath" service install --config $configFullPath 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service installé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'installation" -ForegroundColor Red
        Write-Host "   Sortie : $result" -ForegroundColor Yellow
        Write-Host "`n💡 Si l'erreur persiste, redémarrez l'ordinateur puis réessayez" -ForegroundColor Cyan
        pause
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Étape 7 : Configuration du démarrage automatique
Write-Host "`n7️⃣ Configuration du démarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   ✅ Démarrage automatique configuré" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur lors de la configuration : $($_.Exception.Message)" -ForegroundColor Yellow
}

# Étape 8 : Démarrage du service
Write-Host "`n8️⃣ Démarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    $service = Get-Service -Name "cloudflared"
    Write-Host "   ✅ Service démarré - Statut : $($service.Status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Étape 9 : Vérification finale
Write-Host "`n9️⃣ Vérification finale..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue

Write-Host "   Service : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
Write-Host "   Démarrage : $($service.StartType)" -ForegroundColor White
Write-Host "   Processus : $(if ($processes) { "$($processes.Count) actif(s)" } else { "Aucun" })" -ForegroundColor $(if ($processes) {'Green'} else {'Yellow'})

if ($service.Status -eq 'Running' -and $processes) {
    Write-Host "`n✅ Connecteur Cloudflare rétabli avec succès !" -ForegroundColor Green
} else {
    Write-Host "`n⚠️  Le service est installé mais peut nécessiter un redémarrage" -ForegroundColor Yellow
}

Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Attendez 2-3 minutes pour que le tunnel se connecte" -ForegroundColor White
Write-Host "   2. Vérifiez dans Cloudflare Dashboard :" -ForegroundColor White
Write-Host "      https://one.dash.cloudflare.com/" -ForegroundColor Gray
Write-Host "      Zero Trust → Networks → Tunnels → iahome-new" -ForegroundColor Gray
Write-Host "   3. Le statut devrait passer à 'Healthy'" -ForegroundColor White
Write-Host ""
Write-Host "💡 Commandes utiles :" -ForegroundColor Cyan
Write-Host "   - Vérifier le statut : Get-Service cloudflared" -ForegroundColor Gray
Write-Host "   - Démarrer : Start-Service cloudflared" -ForegroundColor Gray
Write-Host "   - Arrêter : Stop-Service cloudflared" -ForegroundColor Gray
Write-Host "   - Redémarrer : Restart-Service cloudflared" -ForegroundColor Gray
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")


