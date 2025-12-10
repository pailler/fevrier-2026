# Script PowerShell qui demande automatiquement l'élévation administrateur
# Réinstalle le service Cloudflare avec le nouveau token

# Vérifier si on est déjà administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "Demande d'elevation des droits administrateur..." -ForegroundColor Yellow
    
    # Relancer le script avec élévation
    $scriptPath = $MyInvocation.MyCommand.Path
    $token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMDJhOTYwYzUtZWRkNi00YjNmLTg0NGYtNDEwYjE2MjQ3MjYyIiwicyI6InNuNXBuSm5qUnVTaXF5TVdRNXJWdGlZQXFqbkh2Z05sY1U4dWloV2tWMFE9In0="
    
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile", "-ExecutionPolicy", "Bypass", "-File", "`"$scriptPath`"", "-Token", "`"$token`""
    exit
}

# Si on arrive ici, on a les droits administrateur
param(
    [string]$Token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiMDJhOTYwYzUtZWRkNi00YjNmLTg0NGYtNDEwYjE2MjQ3MjYyIiwicyI6InNuNXBuSm5qUnVTaXF5TVdRNXJWdGlZQXFqbkh2Z05sY1U4dWloV2tWMFE9In0="
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Installation Cloudflare Tunnel (Administrateur)      ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`n❌ cloudflared.exe non trouvé à : $cloudflaredPath" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n1️⃣ Arrêt du service actuel (si existe)..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service cloudflared -Force
        Start-Sleep -Seconds 2
    }
    Write-Host "   ✅ Service arrêté" -ForegroundColor Green
}

Write-Host "`n2️⃣ Arrêt des processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_.Id -Force }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
}

Write-Host "`n3️⃣ Désinstallation de l'ancien service..." -ForegroundColor Yellow
try {
    sc.exe delete cloudflared 2>&1 | Out-Null
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Ancien service désinstallé" -ForegroundColor Green
} catch {
    Write-Host "   ℹ️  Aucun service à désinstaller" -ForegroundColor Cyan
}

Write-Host "`n4️⃣ Installation du nouveau service avec le token..." -ForegroundColor Yellow
Write-Host "   Token : $($Token.Substring(0, [Math]::Min(50, $Token.Length)))..." -ForegroundColor Gray
try {
    $result = & "$cloudflaredPath" service install $Token 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service installé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'installation" -ForegroundColor Red
        Write-Host "   Sortie : $result" -ForegroundColor Yellow
        pause
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
    pause
    exit 1
}

Write-Host "`n5️⃣ Démarrage du nouveau service..." -ForegroundColor Yellow
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

Write-Host "`n6️⃣ Vérification finale..." -ForegroundColor Yellow
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






















