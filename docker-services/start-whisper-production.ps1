# Script PowerShell pour démarrer Whisper IA en mode PRODUCTION
# Configuration optimisée avec cloudflared et sécurisation

Write-Host "🚀 DÉMARRAGE WHISPER IA - MODE PRODUCTION" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
if (!(Get-Process "Docker Desktop" -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker Desktop n'est pas en cours d'exécution !" -ForegroundColor Red
    Write-Host "💡 Lancez Docker Desktop et relancez ce script." -ForegroundColor Yellow
    exit 1
}

# Aller dans le répertoire des services
Set-Location -Path "docker-services"

Write-Host "📁 Répertoire de travail : $(Get-Location)" -ForegroundColor Gray

# Vérifier les fichiers requis
$requiredFiles = @(
    "docker-compose.whisper.yml",
    "env.whisper.production",
    "whisper-webui/index.html",
    "nginx/whisper.conf"
)

foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Fichier manquant : $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Tous les fichiers requis sont présents" -ForegroundColor Green

# Vérifier la configuration cloudflared
$envContent = Get-Content "env.whisper.production" -Raw
if ($envContent -notmatch "CLOUDFLARE_TUNNEL_TOKEN=") {
    Write-Host "⚠️  Token cloudflared non trouvé dans env.whisper.production" -ForegroundColor Yellow
}

# Nettoyer les anciens containers si nécessaire
Write-Host "🧹 Nettoyage des anciens containers..." -ForegroundColor Yellow
docker-compose -f docker-compose.whisper.yml down --remove-orphans 2>$null

# Démarrer les services en mode production
Write-Host "🚀 Démarrage des services en mode production..." -ForegroundColor Cyan
Write-Host "   📦 whisper-api-prod (API de transcription)" -ForegroundColor Gray
Write-Host "   🌐 whisper-webui-prod (Interface web)" -ForegroundColor Gray
Write-Host "   🔒 whisper-cloudflared-prod (Tunnel sécurisé)" -ForegroundColor Gray

try {
    # Démarrer avec les variables d'environnement
    docker-compose -f docker-compose.whisper.yml --env-file env.whisper.production up -d
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Services démarrés avec succès !" -ForegroundColor Green
    } else {
        throw "Erreur lors du démarrage des services"
    }
} catch {
    Write-Host "❌ Erreur lors du démarrage : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "💡 Vérifiez les logs avec : docker-compose -f docker-compose.whisper.yml logs" -ForegroundColor Yellow
    exit 1
}

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services (30s)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier le statut des services
Write-Host "📊 Vérification du statut des services..." -ForegroundColor Cyan
Write-Host ""

$containers = @("whisper-api-prod", "whisper-webui-prod", "whisper-cloudflared-prod")
$allRunning = $true

foreach ($container in $containers) {
    $status = docker ps --filter "name=$container" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    if ($status -match $container) {
        $statusColor = if ($status -match "Up") { "Green" } else { "Yellow" }
        Write-Host "✅ $container : $($status.Split("`t")[1])" -ForegroundColor $statusColor
    } else {
        Write-Host "❌ $container : Non trouvé" -ForegroundColor Red
        $allRunning = $false
    }
}

Write-Host ""

# Tests de connectivité
Write-Host "🔍 Tests de connectivité..." -ForegroundColor Cyan

# Test API
try {
    $apiTest = Invoke-WebRequest -Uri "http://localhost:8092/health" -TimeoutSec 10 -ErrorAction Stop
    if ($apiTest.StatusCode -eq 200) {
        Write-Host "✅ API Whisper : Opérationnelle" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  API Whisper : Non accessible ($($_.Exception.Message))" -ForegroundColor Yellow
}

# Test Interface Web
try {
    $webTest = Invoke-WebRequest -Uri "http://localhost:8093" -TimeoutSec 10 -ErrorAction Stop
    if ($webTest.StatusCode -eq 200) {
        Write-Host "✅ Interface Web : Opérationnelle" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️  Interface Web : Non accessible ($($_.Exception.Message))" -ForegroundColor Yellow
}

Write-Host ""

if ($allRunning) {
    Write-Host "🎉 WHISPER IA DÉMARRÉ EN MODE PRODUCTION !" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 ACCÈS AUX SERVICES :" -ForegroundColor Cyan
    Write-Host "   • Interface Web : http://localhost:8093" -ForegroundColor White
    Write-Host "   • API REST : http://localhost:8092" -ForegroundColor White
    Write-Host "   • Health Check : http://localhost:8093/health" -ForegroundColor White
    Write-Host "   • Tunnel Cloudflared : Configuré et actif" -ForegroundColor White
    Write-Host ""
    Write-Host "⚙️  CONFIGURATION PRODUCTION :" -ForegroundColor Yellow
    Write-Host "   • Modèle : base (équilibre vitesse/précision)" -ForegroundColor Gray
    Write-Host "   • Langue : français optimisé" -ForegroundColor Gray
    Write-Host "   • Sécurité : Headers sécurisés + Cloudflared" -ForegroundColor Gray
    Write-Host "   • Compression : Gzip activé" -ForegroundColor Gray
    Write-Host "   • Cache : Optimisé pour la production" -ForegroundColor Gray
    Write-Host "   • Health Checks : Monitoring activé" -ForegroundColor Gray
    Write-Host ""
    Write-Host "📋 COMMANDES DE GESTION :" -ForegroundColor Yellow
    Write-Host "   • Arrêter : .\stop-whisper-production.ps1" -ForegroundColor Gray
    Write-Host "   • Logs : docker-compose -f docker-compose.whisper.yml logs -f" -ForegroundColor Gray
    Write-Host "   • Statut : docker-compose -f docker-compose.whisper.yml ps" -ForegroundColor Gray
    Write-Host "   • Redémarrer : docker-compose -f docker-compose.whisper.yml restart" -ForegroundColor Gray
    Write-Host "   • Mise à jour : docker-compose -f docker-compose.whisper.yml pull && docker-compose -f docker-compose.whisper.yml up -d" -ForegroundColor Gray
    Write-Host ""
    Write-Host "🔧 MONITORING :" -ForegroundColor Yellow
    Write-Host "   • Ressources : docker stats whisper-api-prod whisper-webui-prod whisper-cloudflared-prod" -ForegroundColor Gray
    Write-Host "   • Logs API : docker logs whisper-api-prod -f" -ForegroundColor Gray
    Write-Host "   • Logs Web : docker logs whisper-webui-prod -f" -ForegroundColor Gray
    Write-Host "   • Logs Tunnel : docker logs whisper-cloudflared-prod -f" -ForegroundColor Gray
} else {
    Write-Host "⚠️  CERTAINS SERVICES NE SONT PAS DÉMARRÉS CORRECTEMENT" -ForegroundColor Yellow
    Write-Host "💡 Vérifiez les logs avec : docker-compose -f docker-compose.whisper.yml logs" -ForegroundColor Gray
    Write-Host "💡 Redémarrez avec : .\start-whisper-production.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📚 Documentation complète : docker-services/README-whisper.md" -ForegroundColor Blue
Write-Host "🔗 Support : Vérifiez les logs en cas de problème" -ForegroundColor Blue
