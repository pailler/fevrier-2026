# Script de test pour l'intégration Cloudflared dans IAHome
# Compatible Windows PowerShell

Write-Host "🧪 Test de l'intégration Cloudflared dans IAHome..." -ForegroundColor Green

# Vérifier que Docker Desktop est démarré
Write-Host "📦 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker info | Out-Null
    Write-Host "✅ Docker est démarré" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas démarré. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier les conteneurs en cours d'exécution
Write-Host "🔍 Vérification des conteneurs..." -ForegroundColor Yellow
$containers = docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
Write-Host $containers -ForegroundColor Cyan

# Vérifier les logs du container iahome-app
Write-Host "📋 Logs du container iahome-app:" -ForegroundColor Yellow
docker logs iahome-app --tail=20

# Test de l'API de santé
Write-Host "🔍 Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -UseBasicParsing
    Write-Host "✅ API de santé accessible" -ForegroundColor Green
    Write-Host "📄 Contenu de la réponse: $($response.Content)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ L'API de santé n'est pas accessible" -ForegroundColor Red
    Write-Host "🔍 Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test de l'accès à l'application principale
Write-Host "🌐 Test de l'application principale..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing
    Write-Host "✅ Application principale accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ L'application principale n'est pas accessible" -ForegroundColor Red
}

# Test de la page LibreSpeed
Write-Host "⚡ Test de la page LibreSpeed..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/card/librespeed" -UseBasicParsing
    Write-Host "✅ Page LibreSpeed accessible" -ForegroundColor Green
    
    # Vérifier si le bouton Google OAuth est présent
    if ($response.Content -match "Connectez-vous avec Google") {
        Write-Host "✅ Bouton Google OAuth détecté" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Bouton Google OAuth non détecté" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ La page LibreSpeed n'est pas accessible" -ForegroundColor Red
}

# Vérifier les processus dans le container
Write-Host "🔍 Vérification des processus dans le container..." -ForegroundColor Yellow
docker exec iahome-app ps aux

# Vérifier si cloudflared est installé et fonctionne
Write-Host "📡 Vérification de Cloudflared..." -ForegroundColor Yellow
try {
    $cloudflaredVersion = docker exec iahome-app cloudflared --version
    Write-Host "✅ Cloudflared installé: $cloudflaredVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Cloudflared non accessible dans le container" -ForegroundColor Red
}

Write-Host "✅ Tests terminés !" -ForegroundColor Green
Write-Host "🌐 Application accessible sur: http://localhost:3000" -ForegroundColor Cyan
Write-Host "📡 Tunnel Cloudflared intégré pour: librespeed.iahome.fr" -ForegroundColor Cyan








