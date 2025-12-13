# Script de debug pour installer le service Cloudflare
# DOIT etre execute en tant qu'administrateur

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "  DEBUG INSTALLATION SERVICE CLOUDFLARE" -ForegroundColor Cyan
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
    Write-Host "ERREUR: cloudflared.exe non trouve" -ForegroundColor Red
    pause
    exit 1
}

if (-not (Test-Path $configPath)) {
    Write-Host ""
    Write-Host "ERREUR: Fichier de configuration non trouve" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "Etape 1: Verification de la version de cloudflared..." -ForegroundColor Yellow
try {
    $version = & $cloudflaredPath --version 2>&1
    Write-Host "   Version: $version" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: Impossible de verifier la version" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Etape 2: Verification de l'aide pour 'service'..." -ForegroundColor Yellow
try {
    $help = & $cloudflaredPath service --help 2>&1 | Out-String
    Write-Host "   Aide service:" -ForegroundColor Gray
    Write-Host $help -ForegroundColor Gray
} catch {
    Write-Host "   ATTENTION: Impossible d'obtenir l'aide" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Etape 3: Test de l'installation avec capture complete..." -ForegroundColor Yellow
Write-Host "   Commande: & '$cloudflaredPath' service install --config '$configPath'" -ForegroundColor Gray

try {
    # Capturer stdout et stderr separement
    $stdout = & $cloudflaredPath service install --config $configPath 2>&1 | Where-Object { $_ -is [string] }
    $stderr = $Error | ForEach-Object { $_.Exception.Message }
    
    Write-Host "   Code de sortie: $LASTEXITCODE" -ForegroundColor Gray
    Write-Host "   Sortie standard:" -ForegroundColor Gray
    if ($stdout) {
        Write-Host $stdout -ForegroundColor White
    } else {
        Write-Host "   (aucune sortie)" -ForegroundColor Gray
    }
    
    if ($stderr) {
        Write-Host "   Erreurs:" -ForegroundColor Red
        Write-Host $stderr -ForegroundColor Yellow
    }
    
    # Attendre que le service soit cree
    Write-Host ""
    Write-Host "   Attente de creation du service (10 secondes)..." -ForegroundColor Gray
    Start-Sleep -Seconds 10
    
    # Verifier si le service existe
    $serviceCheck = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
    
    if ($serviceCheck) {
        Write-Host "   OK: Service cree avec succes!" -ForegroundColor Green
        Write-Host "   Statut: $($serviceCheck.Status)" -ForegroundColor Gray
    } else {
        Write-Host "   ERREUR: Service non cree" -ForegroundColor Red
        Write-Host ""
        Write-Host "   Tentative avec syntaxe alternative..." -ForegroundColor Yellow
        
        # Essayer avec le chemin absolu entre guillemets
        Write-Host "   Essai 2: Avec chemins entre guillemets..." -ForegroundColor Gray
        $result2 = & $cloudflaredPath service install --config "$configPath" 2>&1
        Start-Sleep -Seconds 10
        $serviceCheck2 = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue
        if ($serviceCheck2) {
            Write-Host "   OK: Service cree avec syntaxe alternative!" -ForegroundColor Green
        } else {
            Write-Host "   ERREUR: Echec avec syntaxe alternative aussi" -ForegroundColor Red
            Write-Host ""
            Write-Host "   SOLUTIONS POSSIBLES:" -ForegroundColor Cyan
            Write-Host "   1. Redemarrez l'ordinateur et reessayez" -ForegroundColor White
            Write-Host "   2. Verifiez que cloudflared.exe n'est pas bloque par antivirus" -ForegroundColor White
            Write-Host "   3. Essayez d'installer avec un token au lieu du fichier de config" -ForegroundColor White
            Write-Host "   4. Verifiez les permissions sur le fichier de configuration" -ForegroundColor White
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

Write-Host ""
Write-Host "Etape 4: Configuration du demarrage automatique..." -ForegroundColor Yellow
try {
    Set-Service -Name "cloudflared" -StartupType Automatic -ErrorAction Stop
    Write-Host "   OK: Demarrage automatique configure" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: Erreur lors de la configuration" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Etape 5: Demarrage du service..." -ForegroundColor Yellow
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
}

Write-Host ""
Write-Host "Verification finale..." -ForegroundColor Yellow
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
$service = Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue

if ($service) {
    Write-Host "   Service: $($service.Status)" -ForegroundColor $(if ($service.Status -eq 'Running') {'Green'} else {'Red'})
}

if ($processes) {
    Write-Host "   Processus: $($processes.Count) actif(s)" -ForegroundColor Green
} else {
    Write-Host "   Processus: Aucun" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

