# Script de reinstallation COMPLETE et RADICALE de Cloudflare Tunnel
# Nettoie TOUT avant de reinstaller

$ErrorActionPreference = "Stop"

# Verifier les droits administrateur
$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[ERREUR] Ce script NECESSITE les droits administrateur" -ForegroundColor Red
    Write-Host "Relance avec elevation des droits..." -ForegroundColor Yellow
    
    # Essayer plusieurs methodes pour obtenir les droits admin
    try {
        # Methode 1: Start-Process avec RunAs
        $process = Start-Process powershell -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`"" -Verb RunAs -PassThru -ErrorAction Stop
        if ($process) {
            Write-Host "[INFO] Fenetre PowerShell ouverte avec droits administrateur" -ForegroundColor Green
            Write-Host "       Suivez les instructions dans la nouvelle fenetre" -ForegroundColor Yellow
            exit
        }
    } catch {
        Write-Host "[ERREUR] Impossible d'obtenir les droits administrateur automatiquement" -ForegroundColor Red
        Write-Host "         Veuillez executer ce script manuellement en tant qu'administrateur:" -ForegroundColor Yellow
        Write-Host "         1. Clic droit sur PowerShell" -ForegroundColor Gray
        Write-Host "         2. Selectionner 'Executer en tant qu'administrateur'" -ForegroundColor Gray
        Write-Host "         3. Executer: .\scripts\reinstall-cloudflare-complete.ps1" -ForegroundColor Gray
        exit 1
    }
}

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "  REINSTALLATION RADICALE CLOUDFLARE" -ForegroundColor Red
Write-Host "  NETTOYAGE COMPLET AVANT REINSTALL" -ForegroundColor Red
Write-Host "========================================`n" -ForegroundColor Red

$RootPath = Split-Path -Parent $PSScriptRoot
$configPath = Join-Path $RootPath "cloudflare-active-config.yml"

# ETAPE 1: Arret brutal de TOUS les processus
Write-Host "[ETAPE 1/8] Arret brutal de TOUS les processus cloudflared..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    Write-Host "   Arret de $($processes.Count) processus..." -ForegroundColor Gray
    $processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            # Utiliser taskkill si Stop-Process echoue
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/PID", $_.Id -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
    }
    Start-Sleep -Seconds 3
    
    # Verifier qu'il ne reste rien
    $remaining = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "   Utilisation de taskkill pour les processus persistants..." -ForegroundColor Yellow
        $remaining | ForEach-Object {
            Start-Process -FilePath "taskkill" -ArgumentList "/F", "/IM", "cloudflared.exe" -WindowStyle Hidden -Wait -ErrorAction SilentlyContinue
        }
        Start-Sleep -Seconds 2
    }
}
Write-Host "   [OK] Tous les processus arretes" -ForegroundColor Green

# ETAPE 2: Arret et desinstallation du service Windows
Write-Host "`n[ETAPE 2/8] Arret et desinstallation du service Windows..." -ForegroundColor Yellow
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    if ($service.Status -eq 'Running') {
        Write-Host "   Arret du service..." -ForegroundColor Gray
        Stop-Service -Name "cloudflared" -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 3
    }
    
    Write-Host "   Desinstallation du service..." -ForegroundColor Gray
    cloudflared service uninstall 2>&1 | Out-Null
    Start-Sleep -Seconds 3
    
    # Verifier que le service est bien supprime
    $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "   [AVERTISSEMENT] Service toujours present, suppression forcee..." -ForegroundColor Yellow
        sc delete cloudflared 2>&1 | Out-Null
        Start-Sleep -Seconds 2
    }
}
Write-Host "   [OK] Service desinstalle" -ForegroundColor Green

# ETAPE 3: Nettoyage des cles de registre
Write-Host "`n[ETAPE 3/8] Nettoyage des cles de registre..." -ForegroundColor Yellow
try {
    $regPath = "HKLM:\SYSTEM\CurrentControlSet\Services\cloudflared"
    if (Test-Path $regPath) {
        Write-Host "   Suppression de la cle de registre..." -ForegroundColor Gray
        Remove-Item -Path $regPath -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    
    $eventLogPath = "HKLM:\SYSTEM\CurrentControlSet\Services\EventLog\Application\cloudflared"
    if (Test-Path $eventLogPath) {
        Write-Host "   Suppression de la cle EventLog..." -ForegroundColor Gray
        Remove-Item -Path $eventLogPath -Recurse -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 1
    }
    Write-Host "   [OK] Registre nettoye" -ForegroundColor Green
} catch {
    Write-Host "   [AVERTISSEMENT] Erreur lors du nettoyage du registre: $($_.Exception.Message)" -ForegroundColor Yellow
}

# ETAPE 4: Verification des fichiers de configuration
Write-Host "`n[ETAPE 4/8] Verification des fichiers de configuration..." -ForegroundColor Yellow
if (-not (Test-Path $configPath)) {
    Write-Host "   [ERREUR] Fichier de configuration introuvable: $configPath" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Configuration trouvee: $configPath" -ForegroundColor Green

$credentialsPath = "C:\Users\AAA\.cloudflared\02a960c5-edd6-4b3f-844f-410b16247262.json"
if (-not (Test-Path $credentialsPath)) {
    Write-Host "   [ERREUR] Fichier de credentials introuvable: $credentialsPath" -ForegroundColor Red
    exit 1
}
Write-Host "   [OK] Credentials trouves" -ForegroundColor Green

# ETAPE 5: Verification de cloudflared.exe
Write-Host "`n[ETAPE 5/8] Verification de cloudflared.exe..." -ForegroundColor Yellow
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
if (-not $cloudflared) {
    Write-Host "   [ERREUR] cloudflared non trouve dans le PATH" -ForegroundColor Red
    Write-Host "   Verifiez que cloudflared est installe et dans le PATH" -ForegroundColor Yellow
    exit 1
}
Write-Host "   [OK] cloudflared trouve: $($cloudflared.Source)" -ForegroundColor Green

# ETAPE 6: Installation du service
Write-Host "`n[ETAPE 6/8] Installation du service..." -ForegroundColor Yellow
$configFullPath = (Resolve-Path $configPath).Path
Write-Host "   Configuration: $configFullPath" -ForegroundColor Gray

try {
    Write-Host "   Execution: cloudflared service install --config `"$configFullPath`"" -ForegroundColor Gray
    $output = cloudflared service install --config $configFullPath 2>&1
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [ERREUR] Echec de l'installation" -ForegroundColor Red
        Write-Host "   Sortie: $output" -ForegroundColor Gray
        
        # Tentative alternative avec le chemin complet
        Write-Host "   [TENTATIVE] Installation avec chemin complet..." -ForegroundColor Yellow
        $cloudflaredExe = $cloudflared.Source
        & $cloudflaredExe service install --config $configFullPath 2>&1 | Out-Null
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host "   [ERREUR] Echec de l'installation alternative" -ForegroundColor Red
            exit 1
        }
    }
    
    Start-Sleep -Seconds 5
    
    $service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($service) {
        Write-Host "   [OK] Service installe avec succes" -ForegroundColor Green
    } else {
        Write-Host "   [ERREUR] Service non trouve apres installation" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   [ERREUR] Exception lors de l'installation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   StackTrace: $($_.Exception.StackTrace)" -ForegroundColor Gray
    exit 1
}

# ETAPE 7: Configuration du demarrage automatique
Write-Host "`n[ETAPE 7/8] Configuration du demarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   [OK] Demarrage automatique configure" -ForegroundColor Green
} catch {
    Write-Host "   [ERREUR] Impossible de configurer le demarrage automatique: $($_.Exception.Message)" -ForegroundColor Red
}

# ETAPE 8: Demarrage du service
Write-Host "`n[ETAPE 8/8] Demarrage du service..." -ForegroundColor Yellow
try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Start-Sleep -Seconds 5
    
    $service = Get-Service -Name "cloudflared"
    if ($service.Status -eq 'Running') {
        Write-Host "   [OK] Service demarre avec succes" -ForegroundColor Green
    } else {
        Write-Host "   [AVERTISSEMENT] Service non demarre. Statut: $($service.Status)" -ForegroundColor Yellow
        
        # Tentative de demarrage manuel
        Write-Host "   [TENTATIVE] Demarrage manuel..." -ForegroundColor Yellow
        Start-Sleep -Seconds 2
        Start-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
        
        $service = Get-Service -Name "cloudflared"
        if ($service.Status -eq 'Running') {
            Write-Host "   [OK] Service demarre apres tentative manuelle" -ForegroundColor Green
        } else {
            Write-Host "   [ERREUR] Service toujours non demarre" -ForegroundColor Red
        }
    }
} catch {
    Write-Host "   [ERREUR] Impossible de demarrer le service: $($_.Exception.Message)" -ForegroundColor Red
}

# RESUME FINAL
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  REINSTALLATION TERMINEE" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
if ($service) {
    Write-Host "Statut du service: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
    Write-Host "Type de demarrage: $($service.StartType)" -ForegroundColor White
    Write-Host "Configuration: $configFullPath" -ForegroundColor White
    
    if ($service.Status -eq 'Running') {
        Write-Host "`n[INFO] Attente de la connexion du tunnel (60 secondes)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 60
        
        Write-Host "`n[VERIFICATION] Le tunnel devrait maintenant etre actif" -ForegroundColor Green
        Write-Host "   Verifiez dans Cloudflare Dashboard:" -ForegroundColor Gray
        Write-Host "   https://one.dash.cloudflare.com/" -ForegroundColor Gray
        Write-Host "   Zero Trust -> Networks -> Tunnels -> iahome-new" -ForegroundColor Gray
        Write-Host "   Le statut devrait etre 'Healthy'" -ForegroundColor Gray
    } else {
        Write-Host "`n[ACTION] Le service n'est pas demarre" -ForegroundColor Yellow
        Write-Host "   Essayez manuellement: Start-Service cloudflared" -ForegroundColor Gray
        Write-Host "   Ou consultez les logs: Get-EventLog -LogName Application -Source cloudflared -Newest 20" -ForegroundColor Gray
    }
} else {
    Write-Host "[ERREUR] Le service n'a pas ete installe" -ForegroundColor Red
    Write-Host "   Verifiez les erreurs ci-dessus" -ForegroundColor Yellow
}

Write-Host "`nAppuyez sur une touche pour continuer..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

