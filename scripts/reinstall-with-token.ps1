# Script pour réinstaller le service Cloudflare avec un nouveau token
# DOIT être exécuté en tant qu'administrateur

param(
    [Parameter(Mandatory=$true)]
    [string]$Token
)

$ErrorActionPreference = "Stop"

Write-Host "`n╔════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║  Réinstallation Service Cloudflare avec Nouveau Token ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════╝" -ForegroundColor Cyan

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "`n❌ Ce script DOIT être exécuté en tant qu'administrateur" -ForegroundColor Red
    Write-Host "`nPour exécuter :" -ForegroundColor Yellow
    Write-Host "1. Clic droit sur PowerShell → Exécuter en tant qu'administrateur" -ForegroundColor Gray
    Write-Host "2. Exécuter : .\scripts\reinstall-with-token.ps1 -Token '<TOKEN>'" -ForegroundColor Gray
    exit 1
}

$cloudflaredPath = "C:\Program Files (x86)\cloudflared\cloudflared.exe"
if (-not (Test-Path $cloudflaredPath)) {
    Write-Host "`n❌ cloudflared.exe non trouvé à : $cloudflaredPath" -ForegroundColor Red
    exit 1
}

Write-Host "`n1️⃣ Arrêt du service actuel..." -ForegroundColor Yellow
$service = Get-Service cloudflared -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Stop-Service cloudflared -Force
        Start-Sleep -Seconds 3
    }
    Write-Host "   ✅ Service arrêté" -ForegroundColor Green
}

Write-Host "`n2️⃣ Arrêt de tous les processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object { Stop-Process -Id $_.Id -Force }
    Start-Sleep -Seconds 2
    Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
}

Write-Host "`n3️⃣ Désinstallation de l'ancien service..." -ForegroundColor Yellow
try {
    $result = sc.exe delete cloudflared 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service désinstallé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Résultat : $result" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Erreur : $($_.Exception.Message)" -ForegroundColor Yellow
}
Start-Sleep -Seconds 2

Write-Host "`n4️⃣ Installation du nouveau service avec le token..." -ForegroundColor Yellow
Write-Host "   Token : $($Token.Substring(0, [Math]::Min(50, $Token.Length)))..." -ForegroundColor Gray
try {
    $installResult = & "$cloudflaredPath" service install $Token 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Service installé avec succès" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors de l'installation" -ForegroundColor Red
        Write-Host "   Sortie : $installResult" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur : $($_.Exception.Message)" -ForegroundColor Red
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
    exit 1
}

Write-Host "`n6️⃣ Vérification..." -ForegroundColor Yellow
Start-Sleep -Seconds 3
$processes = Get-Process cloudflared -ErrorAction SilentlyContinue
$service = Get-Service cloudflared -ErrorAction SilentlyContinue

Write-Host "   Service : $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
Write-Host "   Processus : $(if ($processes) { "$($processes.Count) actif(s)" } else { "Aucun" })" -ForegroundColor $(if ($processes) {'Green'} else {'Yellow'})

# Vérifier le token utilisé
$serviceConfig = Get-WmiObject Win32_Service | Where-Object {$_.Name -eq "cloudflared"}
if ($serviceConfig.PathName -match "--token\s+(\S+)") {
    $currentToken = $matches[1]
    if ($currentToken -eq $Token) {
        Write-Host "   ✅ Token : Correct" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Token : Différent (peut être normal si le token a été encodé)" -ForegroundColor Yellow
    }
}

Write-Host "`n✅ Réinstallation terminée !" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes :" -ForegroundColor Cyan
Write-Host "   1. Attendez 2-3 minutes" -ForegroundColor White
Write-Host "   2. Vérifiez dans Cloudflare Dashboard :" -ForegroundColor White
Write-Host "      https://one.dash.cloudflare.com/" -ForegroundColor Gray
Write-Host "      Zero Trust → Networks → Tunnels → iahome-new" -ForegroundColor Gray
Write-Host "   3. Le statut devrait passer à 'Healthy'" -ForegroundColor White
Write-Host ""






















