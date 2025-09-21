# Script pour installer le service cloudflared avec privilèges administrateur
# Utilise le token fourni pour installer le service

Write-Host "🔧 Installation du service cloudflared avec privilèges administrateur..." -ForegroundColor Green

$token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJ0IjoiOWY1MDJlMDUtMTRiMy00YjQwLWFiODktYjg2NzNiMjAxMmFiIiwicyI6Ik5qa3dPVGt6WkdFdFlqRTVOaTAwWkRBNUxXSTNaVEl0WXpjM05tRm1PREl6T0dZdyJ9"

Write-Host "`n📋 Token fourni:" -ForegroundColor Yellow
Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor White

# Étape 1: Vérifier les privilèges administrateur
Write-Host "`n🔍 Étape 1: Vérification des privilèges..." -ForegroundColor Yellow

$isAdmin = ([Security.Principal.WindowsPrincipal] [Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole] "Administrator")

if ($isAdmin) {
    Write-Host "✅ Privilèges administrateur détectés" -ForegroundColor Green
} else {
    Write-Host "❌ Privilèges administrateur requis" -ForegroundColor Red
    Write-Host "   Veuillez exécuter ce script en tant qu'administrateur" -ForegroundColor Yellow
    exit 1
}

# Étape 2: Arrêter les processus existants
Write-Host "`n🛑 Étape 2: Arrêt des processus existants..." -ForegroundColor Yellow

$cloudflaredProcesses = Get-Process "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcesses) {
    Write-Host "Arrêt de $($cloudflaredProcesses.Count) processus cloudflared..." -ForegroundColor Cyan
    foreach ($proc in $cloudflaredProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "   ✅ PID $($proc.Id) arrêté" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Impossible d'arrêter le PID: $($proc.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 5
}

# Étape 3: Installer le service cloudflared
Write-Host "`n🚀 Étape 3: Installation du service cloudflared..." -ForegroundColor Yellow

Write-Host "Installation du service avec le token fourni..." -ForegroundColor Cyan
try {
    $installResult = cloudflared.exe service install $token
    Write-Host "Résultat de l'installation:" -ForegroundColor Gray
    Write-Host $installResult -ForegroundColor White
    Write-Host "✅ Service installé avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'installation: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Étape 4: Démarrer le service
Write-Host "`n🚀 Étape 4: Démarrage du service..." -ForegroundColor Yellow

try {
    Start-Service -Name "cloudflared" -ErrorAction Stop
    Write-Host "✅ Service démarré avec succès" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Erreur lors du démarrage du service: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Étape 5: Vérifier l'état du service
Write-Host "`n🔍 Étape 5: Vérification de l'état du service..." -ForegroundColor Yellow

try {
    $serviceStatus = Get-Service -Name "cloudflared" -ErrorAction Stop
    Write-Host "État du service cloudflared:" -ForegroundColor Cyan
    Write-Host "   Status: $($serviceStatus.Status)" -ForegroundColor White
    Write-Host "   StartType: $($serviceStatus.StartType)" -ForegroundColor White
} catch {
    Write-Host "❌ Impossible de vérifier l'état du service: $($_.Exception.Message)" -ForegroundColor Red
}

# Étape 6: Attendre que le service se connecte
Write-Host "`n⏳ Étape 6: Attente de la connexion du service (60 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Étape 7: Vérifier les tunnels
Write-Host "`n🔍 Étape 7: Vérification des tunnels..." -ForegroundColor Yellow

$tunnelList = cloudflared tunnel list
Write-Host "Tunnels disponibles:" -ForegroundColor Cyan
Write-Host $tunnelList -ForegroundColor White

# Étape 8: Tests de connectivité
Write-Host "`n🧪 Étape 8: Tests de connectivité..." -ForegroundColor Yellow

$testDomains = @("iahome.fr", "convert.iahome.fr", "librespeed.iahome.fr", "qrcodes.iahome.fr")

foreach ($domain in $testDomains) {
    Write-Host "Test de $domain..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://$domain" -UseBasicParsing -TimeoutSec 15
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $domain - OK" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $domain - Code: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        if ($_.Exception.Message -like "*1033*") {
            Write-Host "   ❌ $domain - Erreur 1033 (Tunnel hors service)" -ForegroundColor Red
        } elseif ($_.Exception.Message -like "*530*") {
            Write-Host "   ❌ $domain - Erreur 530 (Service indisponible)" -ForegroundColor Red
        } else {
            Write-Host "   ❌ $domain - Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# Étape 9: Résumé
Write-Host "`n🎯 Résumé de l'installation..." -ForegroundColor Green

$serviceRunning = (Get-Service -Name "cloudflared" -ErrorAction SilentlyContinue).Status -eq "Running"

if ($serviceRunning) {
    Write-Host "✅ Service cloudflared installé et opérationnel!" -ForegroundColor Green
    Write-Host "`n📋 État final:" -ForegroundColor Cyan
    Write-Host "   • Service: cloudflared (Running)" -ForegroundColor White
    Write-Host "   • Token: Installé" -ForegroundColor White
    Write-Host "   • Tunnels: Configurés" -ForegroundColor White
    
    Write-Host "`n🔗 Domaines testés:" -ForegroundColor Cyan
    foreach ($domain in $testDomains) {
        Write-Host "   • https://$domain" -ForegroundColor White
    }
} else {
    Write-Host "❌ Échec de l'installation du service" -ForegroundColor Red
    Write-Host "`n🔧 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier les logs du service" -ForegroundColor White
    Write-Host "   2. Redémarrer le service" -ForegroundColor White
    Write-Host "   3. Vérifier la configuration DNS dans Cloudflare" -ForegroundColor White
}

Write-Host "`n🏁 Installation terminée!" -ForegroundColor Green
