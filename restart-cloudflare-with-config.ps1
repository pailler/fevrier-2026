# Script pour redémarrer cloudflared avec la configuration iahome
# Arrête le service et le redémarre avec la configuration personnalisée

Write-Host "🔧 Redémarrage de cloudflared avec la configuration iahome..." -ForegroundColor Green

$tunnelName = "iahome"
$configPath = "ssl/cloudflare/config-iahome.yml"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   • Tunnel: $tunnelName" -ForegroundColor White
Write-Host "   • Config: $configPath" -ForegroundColor White

# Étape 1: Arrêter le service cloudflared
Write-Host "`n🛑 Étape 1: Arrêt du service cloudflared..." -ForegroundColor Yellow

try {
    Stop-Service -Name "cloudflared" -Force -ErrorAction Stop
    Write-Host "✅ Service arrêté" -ForegroundColor Green
    Start-Sleep -Seconds 5
} catch {
    Write-Host "⚠️  Erreur lors de l'arrêt du service: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Étape 2: Arrêter tous les processus cloudflared
Write-Host "`n🛑 Étape 2: Arrêt des processus cloudflared..." -ForegroundColor Yellow

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

# Étape 3: Vérifier que la configuration existe
Write-Host "`n🔍 Étape 3: Vérification de la configuration..." -ForegroundColor Yellow

if (Test-Path $configPath) {
    Write-Host "✅ Configuration trouvée: $configPath" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration manquante: $configPath" -ForegroundColor Red
    Write-Host "   Création de la configuration..." -ForegroundColor Yellow
    
    # Créer la configuration
    $configContent = @"
tunnel: 9f502e05-14b3-4b40-ab89-b8673b2012ab
credentials-file: ssl/cloudflare/credentials-iahome.json

# Configuration du tunnel iahome
no-autoupdate: true
logfile: logs/cloudflared.log
loglevel: info

ingress:
  # Application principale IAHome
  - hostname: iahome.fr
    service: http://172.18.0.2:3000
    originRequest:
      timeout: 900s
      httpHostHeader: iahome.fr
      noTLSVerify: false
  - hostname: www.iahome.fr
    service: http://172.18.0.2:3000
    originRequest:
      timeout: 900s
      httpHostHeader: www.iahome.fr
      noTLSVerify: false

  # Services de conversion
  - hostname: convert.iahome.fr
    service: http://172.18.0.2:3000
    originRequest:
      timeout: 900s
      httpHostHeader: convert.iahome.fr
      noTLSVerify: false

  # LibreSpeed avec authentification centralisée
  - hostname: librespeed.iahome.fr
    service: http://192.168.1.150:7006
    originRequest:
      httpHostHeader: librespeed.iahome.fr
      timeout: 30s
      noTLSVerify: false

  # Service QR Codes
  - hostname: qrcodes.iahome.fr
    service: http://192.168.1.150:5000
    originRequest:
      httpHostHeader: qrcodes.iahome.fr
      timeout: 30s
      noTLSVerify: false

  # Catch-all rule
  - service: http_status:404
"@

    $configContent | Out-File -FilePath $configPath -Encoding UTF8
    Write-Host "✅ Configuration créée" -ForegroundColor Green
}

# Étape 4: Démarrer cloudflared avec la configuration
Write-Host "`n🚀 Étape 4: Démarrage de cloudflared avec la configuration..." -ForegroundColor Yellow

Write-Host "Démarrage du tunnel $tunnelName avec la configuration $configPath..." -ForegroundColor Cyan

# Démarrer cloudflared en arrière-plan avec la configuration
Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "run", $tunnelName, "--config", $configPath -NoNewWindow -PassThru | Out-Null

Write-Host "✅ Cloudflared démarré avec la configuration" -ForegroundColor Green

# Étape 5: Attendre la connexion
Write-Host "`n⏳ Étape 5: Attente de la connexion du tunnel (60 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Étape 6: Vérifier l'état du tunnel
Write-Host "`n🔍 Étape 6: Vérification de l'état du tunnel..." -ForegroundColor Yellow

$tunnelStatus = cloudflared tunnel info $tunnelName
Write-Host "État du tunnel:" -ForegroundColor Cyan
Write-Host $tunnelStatus -ForegroundColor White

# Étape 7: Tests de connectivité
Write-Host "`n🧪 Étape 7: Tests de connectivité..." -ForegroundColor Yellow

$testDomains = @("iahome.fr", "librespeed.iahome.fr", "qrcodes.iahome.fr")

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
Write-Host "`n🎯 Résumé du redémarrage..." -ForegroundColor Green

$tunnelHasConnection = $tunnelStatus -like "*active connection*"
$cloudflaredRunning = (Get-Process "cloudflared" -ErrorAction SilentlyContinue).Count -gt 0

if ($tunnelHasConnection -and $cloudflaredRunning) {
    Write-Host "✅ Cloudflared redémarré avec succès!" -ForegroundColor Green
    Write-Host "`n📋 État final:" -ForegroundColor Cyan
    Write-Host "   • Tunnel: $tunnelName" -ForegroundColor White
    Write-Host "   • Configuration: $configPath" -ForegroundColor White
    Write-Host "   • Connexions: Actives" -ForegroundColor White
    Write-Host "   • Processus: $((Get-Process cloudflared -ErrorAction SilentlyContinue).Count) en cours" -ForegroundColor White
} else {
    Write-Host "❌ Redémarrage échoué" -ForegroundColor Red
    Write-Host "`n🔧 Actions recommandées:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier les logs dans logs/cloudflared.log" -ForegroundColor White
    Write-Host "   2. Vérifier la configuration DNS dans Cloudflare" -ForegroundColor White
    Write-Host "   3. Redémarrer manuellement cloudflared" -ForegroundColor White
}

Write-Host "`n🏁 Redémarrage terminé!" -ForegroundColor Green
