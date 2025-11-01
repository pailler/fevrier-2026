# Script pour redémarrer le tunnel Cloudflare avec la nouvelle configuration pour LibreSpeed

Write-Host "🔄 Redémarrage du tunnel Cloudflare pour appliquer la nouvelle configuration LibreSpeed..." -ForegroundColor Cyan
Write-Host ""

# 1. Arrêter tous les processus cloudflared
Write-Host "1️⃣ Arrêt des processus cloudflared existants..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "   Trouvé $($processes.Count) processus cloudflared" -ForegroundColor Gray
        $processes | Stop-Process -Force
        Start-Sleep -Seconds 2
        Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Aucun processus cloudflared en cours" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 2. Vérifier la configuration
Write-Host ""
Write-Host "2️⃣ Vérification de la configuration..." -ForegroundColor Yellow
$configFile = "cloudflare-active-config.yml"
if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    if ($config -match "librespeed\.iahome\.fr") {
        if ($config -match "hostname: librespeed\.iahome\.fr[\s\S]*?service: http://localhost:80") {
            Write-Host "   ✅ Configuration correcte: librespeed.iahome.fr → localhost:80 (Traefik)" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️ Configuration peut-être incorrecte. Vérifiez que le service pointe vers localhost:80" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ❌ librespeed.iahome.fr non trouvé dans la configuration" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ❌ Fichier $configFile non trouvé" -ForegroundColor Red
    exit 1
}

# 3. Vérifier que Traefik est accessible
Write-Host ""
Write-Host "3️⃣ Vérification que Traefik est accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Traefik est accessible sur localhost:80" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️ Traefik peut ne pas être accessible: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   💡 Vérifiez que Traefik tourne: docker-compose -f docker-compose.prod.yml ps traefik" -ForegroundColor Gray
}

# 4. Démarrer le tunnel
Write-Host ""
Write-Host "4️⃣ Démarrage du tunnel Cloudflare..." -ForegroundColor Yellow
$configPath = Resolve-Path $configFile

try {
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    Write-Host "   ✅ Tunnel démarré" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 5. Attendre que le tunnel se connecte
Write-Host ""
Write-Host "5️⃣ Attente de la connexion du tunnel..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 6. Vérifier le statut du tunnel
Write-Host ""
Write-Host "6️⃣ Vérification du statut du tunnel..." -ForegroundColor Yellow
try {
    $tunnelInfo = & cloudflared tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID") {
        Write-Host "   ✅ Tunnel connecté avec succès!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Tunnel peut ne pas être complètement connecté" -ForegroundColor Yellow
        Write-Host "   Informations: $($tunnelInfo -join '`n')" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️ Impossible de vérifier le statut du tunnel" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Redémarrage terminé!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Testez maintenant l'accès:" -ForegroundColor Cyan
Write-Host "   https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "   → Devrait rediriger vers https://iahome.fr (sans token)" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Attendez 30-60 secondes pour que la configuration soit complètement prise en compte" -ForegroundColor Yellow
Write-Host ""


