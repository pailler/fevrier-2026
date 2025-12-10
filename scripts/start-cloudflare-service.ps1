# Script pour démarrer le service Cloudflare Tunnel
# Vérifie et démarre le service si nécessaire

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  DEMARRAGE CLOUDFLARE TUNNEL" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Vérifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[AVERTISSEMENT] Certaines operations peuvent necessiter les droits administrateur" -ForegroundColor Yellow
}

# Vérifier le service
Write-Host "[1/3] Verification du service..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue

if (-not $service) {
    Write-Host "   [ERREUR] Service non installe" -ForegroundColor Red
    Write-Host "   [ACTION] Installation du service necessaire..." -ForegroundColor Yellow
    Write-Host "   Executez: .\scripts\force-install-cloudflare.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host "   [OK] Service trouve" -ForegroundColor Green
Write-Host "   Statut actuel: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Yellow'})

# Arrêter les processus existants si nécessaire
Write-Host "`n[2/3] Arret des processus existants..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "   [OK] Processus arretes" -ForegroundColor Green
} else {
    Write-Host "   [OK] Aucun processus a arreter" -ForegroundColor Green
}

# Démarrer le service
Write-Host "`n[3/3] Demarrage du service..." -ForegroundColor Yellow
if ($service.Status -eq 'Running') {
    Write-Host "   [INFO] Service deja en cours d'execution" -ForegroundColor Gray
    Write-Host "   [ACTION] Redemarrage du service..." -ForegroundColor Yellow
    Restart-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
} else {
    try {
        Start-Service -Name "cloudflared" -ErrorAction Stop
        Write-Host "   [OK] Service demarre" -ForegroundColor Green
    } catch {
        Write-Host "   [ERREUR] Impossible de demarrer le service: $($_.Exception.Message)" -ForegroundColor Red
        if (-not $isAdmin) {
            Write-Host "   [INFO] Essayez d'executer ce script en tant qu'administrateur" -ForegroundColor Yellow
        }
        exit 1
    }
}

Start-Sleep -Seconds 5

# Vérification finale
Write-Host "`n[VERIFICATION] Etat final..." -ForegroundColor Cyan
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service.Status -eq 'Running') {
    Write-Host "   [OK] Service en cours d'execution" -ForegroundColor Green
    Write-Host "   Statut: $($service.Status)" -ForegroundColor White
    Write-Host "   Type de demarrage: $($service.StartType)" -ForegroundColor White
    
    # Attendre que le tunnel se connecte
    Write-Host "`n[INFO] Attente de la connexion du tunnel (30 secondes)..." -ForegroundColor Yellow
    Start-Sleep -Seconds 30
    
    Write-Host "`n[RESUME] Le tunnel Cloudflare devrait maintenant etre actif" -ForegroundColor Green
    Write-Host "   Verifiez dans Cloudflare Dashboard que le tunnel est 'Healthy'" -ForegroundColor Gray
} else {
    Write-Host "   [ERREUR] Le service n'est pas en cours d'execution" -ForegroundColor Red
    Write-Host "   Statut: $($service.Status)" -ForegroundColor Yellow
    Write-Host "   [ACTION] Essayez de demarrer manuellement: Start-Service cloudflared" -ForegroundColor Gray
}

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TERMINE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Appuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")














