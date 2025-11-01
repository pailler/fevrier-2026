# Script de reconstruction complète de la configuration sécurisée pour LibreSpeed
# Approche simplifiée : Cloudflare Tunnel → API Next.js directement

Write-Host "🔧 Reconstruction de la configuration sécurisée pour LibreSpeed..." -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier la configuration actuelle
Write-Host "1️⃣ Vérification de la configuration..." -ForegroundColor Yellow
$configFile = "cloudflare-active-config.yml"
if (Test-Path $configFile) {
    $config = Get-Content $configFile -Raw
    if ($config -match "librespeed\.iahome\.fr.*?service: http://localhost:3000/api/librespeed-redirect") {
        Write-Host "   ✅ Configuration correcte: librespeed.iahome.fr → localhost:3000/api/librespeed-redirect" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Configuration à mettre à jour" -ForegroundColor Yellow
    }
} else {
    Write-Host "   ❌ Fichier $configFile non trouvé" -ForegroundColor Red
    exit 1
}

# 2. Vérifier que Next.js est accessible
Write-Host ""
Write-Host "2️⃣ Vérification que Next.js est accessible..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
    Write-Host "   ✅ Next.js accessible sur localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Next.js non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   💡 Démarrez Next.js: docker-compose -f docker-compose.prod.yml up -d iahome-app" -ForegroundColor Yellow
    exit 1
}

# 3. Tester l'API de redirection
Write-Host ""
Write-Host "3️⃣ Test de l'API de redirection..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/librespeed-redirect" -Method Head -MaximumRedirection 0 -ErrorAction Stop
    Write-Host "   ⚠️ Pas de redirection (Code: $($response.StatusCode))" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 302 -or $_.Exception.Response.StatusCode -eq 307) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   ✅ Redirection détectée vers: $location" -ForegroundColor Green
        if ($location -match "iahome\.fr") {
            Write-Host "   ✅ API fonctionne correctement!" -ForegroundColor Green
        }
    } else {
        Write-Host "   ⚠️ Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
    }
}

# 4. Arrêter le tunnel Cloudflare
Write-Host ""
Write-Host "4️⃣ Arrêt du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    $processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
    if ($processes) {
        Write-Host "   Trouvé $($processes.Count) processus cloudflared" -ForegroundColor Gray
        foreach ($proc in $processes) {
            try {
                Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            } catch {
                Write-Host "   ⚠️ Impossible d'arrêter le processus $($proc.Id)" -ForegroundColor Yellow
            }
        }
        Start-Sleep -Seconds 3
        Write-Host "   ✅ Processus arrêtés" -ForegroundColor Green
    } else {
        Write-Host "   ✅ Aucun processus cloudflared en cours" -ForegroundColor Green
    }
} catch {
    Write-Host "   ⚠️ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 5. Démarrer le tunnel avec la nouvelle configuration
Write-Host ""
Write-Host "5️⃣ Démarrage du tunnel Cloudflare avec la nouvelle configuration..." -ForegroundColor Yellow
$configPath = Resolve-Path $configFile

try {
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "`"$configPath`"", "run", "iahome-new" -WindowStyle Hidden
    Write-Host "   ✅ Tunnel démarré" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Attendre la connexion
Write-Host ""
Write-Host "6️⃣ Attente de la connexion du tunnel..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 7. Vérifier le statut
Write-Host ""
Write-Host "7️⃣ Vérification du statut du tunnel..." -ForegroundColor Yellow
try {
    $tunnelInfo = & cloudflared tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID") {
        Write-Host "   ✅ Tunnel connecté avec succès!" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Vérifiez manuellement le statut" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Impossible de vérifier le statut" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "✅ Reconstruction terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 NOUVELLE CONFIGURATION:" -ForegroundColor Cyan
Write-Host "   Cloudflare Tunnel → localhost:3000/api/librespeed-redirect" -ForegroundColor White
Write-Host "   Next.js API → Vérifie token → Redirige" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Testez maintenant:" -ForegroundColor Yellow
Write-Host "   https://librespeed.iahome.fr" -ForegroundColor White
Write-Host "   → Devrait rediriger vers https://iahome.fr (sans token)" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Attendez 30-60 secondes pour la propagation Cloudflare" -ForegroundColor Yellow
Write-Host ""

