# Script pour nettoyer complètement et réinstaller Cloudflare Tunnel
# DOIT être exécuté en tant qu'administrateur

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ Ce script DOIT être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "`nPour exécuter :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell → Exécuter en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "2. Exécuter : .\reinstall-cloudflare-clean.ps1" -ForegroundColor Gray
    exit 1
}

$ErrorActionPreference = "Continue"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Nettoyage et Réinstallation Cloudflare Tunnel       ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMDJhOTYwYzUtZWRkNi00YjNmLTg0NGYtNDEwYjE2MjQ3MjYyIiwicyI6InNuNXBuSm5qUnVTaXF5TVdRNXJWdGlZQXFqbkh2Z05sY1U4dWloV2tWMFE9In0="
$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"

if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`n❌ cloudflared.exe non trouvé à : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

# Étape 1 : Arrêt du service
Write-Host "`n1️⃣ Arrêt du service..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service cloudflared -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
    }
    Write-Host "   ✅ Service arrêté" -ForegroundColor Green
}

# Étape 2 : Arrêt des processus
Write-Host "`n2️⃣ Arrêt des processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
}

# Étape 3 : Désinstallation du service
Write-Host "`n3️⃣ Désinstallation du service..." -ForegroundColor Yellow
try {
    sc.exe delete cloudflared 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Service désinstallé" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️  Service déjà désinstallé ou inexistant" -ForegroundColor Cyan
}

# Étape 4 : Nettoyage de la clé de registre Event Logger
Write-Host "`n4️⃣ Nettoyage de la clé de registre Event Logger..." -ForegroundColor Yellow
$regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\EventLog\Application\Cloudflared"
if (Test-Path $regPath) {
    try {
        Remove-Item -Path $regPath -Recurse -Force -ErrorAction Stop
        Write-Host "   ✅ Clé de registre supprimée" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️  Erreur lors de la suppression : $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Tentative avec reg.exe..." -ForegroundColor Gray
        try {
            reg.exe delete "HKLM\SYSTEM\CurrentControlSet\Services\EventLog\Application\Cloudflared" /f 2>&1 | Out-Null
            Write-Host "   ✅ Clé supprimée avec reg.exe" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Impossible de supprimer la clé" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "   ℹ️  Clé de registre non trouvée (déjà supprimée)" -ForegroundColor Cyan
}

# Étape 5 : Attente pour s'assurer que tout est nettoyé
Write-Host "`n5️⃣ Attente de nettoyage complet..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

# Étape 6 : Installation du nouveau service
Write-Host "`n6️⃣ Installation du nouveau service avec le token..." -ForegroundColor Yellow
Write-Host "   Token : $($token.Substring(0, [Math]::Min(50, $token.Length)))..." -ForegroundColor Gray
try {
    $result = & "$cloudflaredPath" service install $token 2>&1
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

# Étape 7 : Démarrage du service
Write-Host "`n7️⃣ Démarrage du nouveau service..." -ForegroundColor Yellow
Start-Sleep -Seconds 2
try {
    Start-Service cloudflared -ErrorAction Stop
    Start-Sleep -Seconds 5
    $service = Get-Service cloudflared
    Write-Host "   ✅ Service démarré - Statut : $($service.Status)" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

# Étape 8 : Vérification finale
Write-Host "`n8️⃣ Vérification finale..." -ForegroundColor Yellow
$processes = Get-Process cloudflared -ErrorAction SilentlyContinue
$service = Get-Service cloudflared -ErrorAction SilentlyContinue

Write-Host "   Service : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
Write-Host "   Processus : $(if ($processes) { "$($processes.Count) actif(s)" } else { "Aucun" })" -ForegroundColor $(if ($processes) {'Green'} else {'Yellow'})

Write-Host "`n✅ Installation terminée avec succès !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Attendez 2-3 minutes" -ForegroundColor White
Write-Host "   2. Vérifiez dans Cloudflare Dashboard :" -ForegroundColor White
Write-Host "      https://one.dash.cloudflare.com/" -ForegroundColor Gray
Write-Host "      Zero Trust → Networks → Tunnels → iahome-new" -ForegroundColor Gray
Write-Host "   3. Le statut devrait passer à 'Healthy'" -ForegroundColor White
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")






