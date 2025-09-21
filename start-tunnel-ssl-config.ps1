# Script pour démarrer le tunnel avec la configuration ssl/cloudflare
# Utilise la configuration existante dans ssl/cloudflare/

Write-Host "🚀 Démarrage du tunnel avec la configuration ssl/cloudflare..." -ForegroundColor Green

$tunnelName = "iahome-new"
$tunnelId = "f5ac6849-ceb1-413a-8c3c-f1cf3292938d"

Write-Host "`n📋 Informations du tunnel:" -ForegroundColor Yellow
Write-Host "   • Nom: $tunnelName" -ForegroundColor White
Write-Host "   • ID: $tunnelId" -ForegroundColor White

# Étape 1: Vérifier les configurations disponibles
Write-Host "`n📁 Étape 1: Configurations disponibles dans ssl/cloudflare..." -ForegroundColor Yellow

$configFiles = Get-ChildItem -Path "ssl/cloudflare" -Filter "*.yml" | Select-Object Name
Write-Host "Fichiers de configuration YAML:" -ForegroundColor Cyan
foreach ($file in $configFiles) {
    Write-Host "   • $($file.Name)" -ForegroundColor White
}

# Étape 2: Utiliser la configuration principale
Write-Host "`n⚙️ Étape 2: Utilisation de la configuration principale..." -ForegroundColor Yellow

$mainConfigPath = "ssl/cloudflare/config.yml"
if (Test-Path $mainConfigPath) {
    Write-Host "✅ Configuration principale trouvée: $mainConfigPath" -ForegroundColor Green
    $config = Get-Content $mainConfigPath -Raw
    Write-Host "Contenu de la configuration:" -ForegroundColor Cyan
    Write-Host $config.Substring(0, [Math]::Min(300, $config.Length)) -ForegroundColor Gray
} else {
    Write-Host "❌ Configuration principale non trouvée" -ForegroundColor Red
    exit 1
}

# Étape 3: Arrêter les processus existants
Write-Host "`n🛑 Étape 3: Arrêt des processus existants..." -ForegroundColor Yellow

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
} else {
    Write-Host "ℹ️  Aucun processus cloudflared en cours d'exécution" -ForegroundColor Cyan
}

# Étape 4: Démarrer le tunnel avec la configuration ssl/cloudflare
Write-Host "`n🚀 Étape 4: Démarrage du tunnel..." -ForegroundColor Yellow

Write-Host "Démarrage du tunnel $tunnelName avec ssl/cloudflare/config.yml..." -ForegroundColor Cyan
Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "run", $tunnelName, "--config", $mainConfigPath -WindowStyle Normal

# Attendre que le tunnel se connecte
Write-Host "⏳ Attente de la connexion du tunnel (120 secondes)..." -ForegroundColor Cyan
Start-Sleep -Seconds 120

# Étape 5: Vérifier l'état du tunnel
Write-Host "`n🔍 Étape 5: Vérification de l'état du tunnel..." -ForegroundColor Yellow

$tunnelStatus = cloudflared tunnel info $tunnelName
Write-Host "État du tunnel:" -ForegroundColor Cyan
Write-Host $tunnelStatus -ForegroundColor White

# Étape 6: Vérifier les processus cloudflared
Write-Host "`n🔍 Étape 6: Vérification des processus..." -ForegroundColor Yellow

$cloudflaredProcesses = Get-Process "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcesses) {
    Write-Host "Processus cloudflared en cours d'exécution:" -ForegroundColor Cyan
    foreach ($proc in $cloudflaredProcesses) {
        Write-Host "   PID: $($proc.Id) - Démarrage: $($proc.StartTime)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Aucun processus cloudflared en cours d'exécution" -ForegroundColor Red
}

# Étape 7: Tests de connectivité
Write-Host "`n🧪 Étape 7: Tests de connectivité..." -ForegroundColor Yellow

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

# Étape 8: Résumé
Write-Host "`n🎯 Résumé du démarrage..." -ForegroundColor Green

$tunnelHasConnection = $tunnelStatus -like "*active connection*"
$cloudflaredRunning = (Get-Process "cloudflared" -ErrorAction SilentlyContinue).Count -gt 0

if ($tunnelHasConnection -and $cloudflaredRunning) {
    Write-Host "✅ Tunnel démarré avec succès!" -ForegroundColor Green
    Write-Host "`n📋 État final:" -ForegroundColor Cyan
    Write-Host "   • Configuration: ssl/cloudflare/config.yml" -ForegroundColor White
    Write-Host "   • Tunnel: $tunnelName ($tunnelId)" -ForegroundColor White
    Write-Host "   • Connexions: Actives" -ForegroundColor White
    Write-Host "   • Processus: $((Get-Process "cloudflared" -ErrorAction SilentlyContinue).Count) en cours" -ForegroundColor White
    
    Write-Host "`n🔗 Domaines configurés:" -ForegroundColor Cyan
    foreach ($domain in $testDomains) {
        Write-Host "   • https://$domain" -ForegroundColor White
    }
} else {
    Write-Host "❌ Échec du démarrage du tunnel" -ForegroundColor Red
    Write-Host "`n🔧 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier les logs dans logs/cloudflared.log" -ForegroundColor White
    Write-Host "   2. Vérifier la configuration DNS dans Cloudflare" -ForegroundColor White
    Write-Host "   3. Redémarrer le système" -ForegroundColor White
}

Write-Host "`n🏁 Démarrage terminé!" -ForegroundColor Green
