# Script de démarrage complet d'iahome avec Cloudflare
# Ce script démarre tous les services nécessaires pour iahome

Write-Host "🚀 Démarrage complet d'iahome avec Cloudflare..." -ForegroundColor Cyan

# 1. Vérifier Docker
Write-Host "🐳 Vérification de Docker..." -ForegroundColor Yellow
try {
    $dockerVersion = docker --version
    Write-Host "✅ Docker détecté: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé ou pas démarré" -ForegroundColor Red
    Write-Host "💡 Démarrez Docker Desktop" -ForegroundColor Yellow
    exit 1
}

# 2. Vérifier cloudflared
Write-Host "🌐 Vérification de cloudflared..." -ForegroundColor Yellow
try {
    $cloudflaredVersion = cloudflared --version
    Write-Host "✅ Cloudflared détecté: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflared n'est pas installé" -ForegroundColor Red
    Write-Host "💡 Installez cloudflared depuis: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Yellow
    exit 1
}

# 3. Arrêter les services existants
Write-Host "⏹️ Arrêt des services existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down

# 4. Nettoyer les caches
Write-Host "🧹 Nettoyage des caches..." -ForegroundColor Yellow
docker system prune -f

# 5. Vérifier et libérer le port 3000
Write-Host "🔍 Vérification du port 3000..." -ForegroundColor Yellow
$processes = netstat -ano | findstr :3000
if ($processes) {
    Write-Host "⚠️ Processus détectés sur le port 3000, arrêt en cours..." -ForegroundColor Red
    $pids = ($processes | ForEach-Object { ($_ -split '\s+')[4] } | Sort-Object -Unique)
    foreach ($pid in $pids) {
        if ($pid -match '^\d+$') {
            try {
                taskkill /PID $pid /F
                Write-Host "✅ Processus $pid arrêté" -ForegroundColor Green
            } catch {
                Write-Host "❌ Impossible d'arrêter le processus $pid" -ForegroundColor Red
            }
        }
    }
}

# 6. Reconstruire l'application
Write-Host "🔨 Reconstruction de l'application..." -ForegroundColor Yellow
npm run build

# 7. Démarrer les services Docker
Write-Host "🐳 Démarrage des services Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d

# 8. Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# 9. Vérifier le statut des services
Write-Host "📊 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml ps

# 10. Démarrer le tunnel Cloudflare
Write-Host "🌐 Démarrage du tunnel Cloudflare..." -ForegroundColor Yellow
$tunnelInfo = cloudflared tunnel info iahome-new 2>&1

if ($tunnelInfo -match "does not have any active connection") {
    Write-Host "🚀 Démarrage du tunnel iahome-new..." -ForegroundColor Cyan
    Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "run", "iahome-new" -WindowStyle Hidden
    
    # Attendre la connexion
    Start-Sleep -Seconds 10
    
    # Vérifier le statut
    $tunnelInfoAfter = cloudflared tunnel info iahome-new 2>&1
    if ($tunnelInfoAfter -match "CONNECTOR ID") {
        Write-Host "✅ Tunnel Cloudflare démarré avec succès!" -ForegroundColor Green
    } else {
        Write-Host "❌ Échec du démarrage du tunnel" -ForegroundColor Red
    }
} else {
    Write-Host "✅ Le tunnel Cloudflare est déjà actif" -ForegroundColor Green
}

# 11. Tests d'accessibilité
Write-Host "🌐 Tests d'accessibilité..." -ForegroundColor Yellow

# Test local
try {
    $localResponse = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5
    if ($localResponse.StatusCode -eq 200) {
        Write-Host "✅ Application accessible localement: http://localhost:3000" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Application non accessible localement" -ForegroundColor Red
}

# Test via Cloudflare
try {
    $cloudflareResponse = Invoke-WebRequest -Uri "https://iahome.fr" -Method Head -TimeoutSec 10
    if ($cloudflareResponse.StatusCode -eq 200) {
        Write-Host "✅ Site accessible via Cloudflare: https://iahome.fr" -ForegroundColor Green
        Write-Host "🛡️ Serveur: $($cloudflareResponse.Headers['Server'])" -ForegroundColor Cyan
        Write-Host "🌍 CF-RAY: $($cloudflareResponse.Headers['CF-RAY'])" -ForegroundColor Cyan
    }
} catch {
    Write-Host "❌ Site non accessible via Cloudflare: $($_.Exception.Message)" -ForegroundColor Red
}

# 12. Afficher les informations finales
Write-Host "`n🎉 Démarrage terminé!" -ForegroundColor Green
Write-Host "📋 Résumé des services:" -ForegroundColor Cyan
Write-Host "  • Application locale: http://localhost:3000" -ForegroundColor White
Write-Host "  • Site public: https://iahome.fr" -ForegroundColor White
Write-Host "  • Traefik Dashboard: http://localhost:8080" -ForegroundColor White
Write-Host "  • n8n: http://localhost:5678" -ForegroundColor White

Write-Host "`n🔧 Commandes utiles:" -ForegroundColor Cyan
Write-Host "  • Voir les logs: docker-compose -f docker-compose.prod.yml logs -f" -ForegroundColor White
Write-Host "  • Arrêter les services: docker-compose -f docker-compose.prod.yml down" -ForegroundColor White
Write-Host "  • Surveiller le tunnel: .\monitor-cloudflare-tunnel.ps1" -ForegroundColor White

Write-Host "`n🌐 iahome est maintenant opérationnel!" -ForegroundColor Green
