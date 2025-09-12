# Script de déploiement Docker pour Photo Portfolio IA (PowerShell)
Write-Host "🚀 Déploiement Docker - Photo Portfolio IA iAhome" -ForegroundColor Green
Write-Host "==================================================" -ForegroundColor Green

# Vérifier que Docker est installé
try {
    docker --version | Out-Null
    Write-Host "✅ Docker trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop d'abord." -ForegroundColor Red
    exit 1
}

try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier les fichiers de configuration
Write-Host "`n📋 Vérification des fichiers de configuration..." -ForegroundColor Yellow

$requiredFiles = @(
    "Dockerfile.photo-portfolio",
    "docker-compose.photo-portfolio.yml",
    "nginx/photo-portfolio.conf"
)

foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ $file trouvé" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
        exit 1
    }
}

# Vérifier le fichier .env.local
if (-not (Test-Path ".env.local")) {
    Write-Host "⚠️  Fichier .env.local manquant. Création d'un exemple..." -ForegroundColor Yellow
    $envContent = @"
# Configuration Photo Portfolio IA
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_api_key
OPENAI_EMBEDDING_MODEL=text-embedding-3-small
OPENAI_EMBEDDING_DIMENSIONS=1536
SUPABASE_STORAGE_BUCKET=photo-portfolio
MAX_FILE_SIZE=10485760
ALLOWED_IMAGE_TYPES=image/jpeg,image/png,image/gif,image/webp
"@
    $envContent | Out-File -FilePath ".env.local" -Encoding UTF8
    Write-Host "📝 Veuillez configurer le fichier .env.local avec vos clés API" -ForegroundColor Yellow
}

Write-Host "✅ Fichiers de configuration trouvés" -ForegroundColor Green

# Arrêter les conteneurs existants
Write-Host "`n🛑 Arrêt des conteneurs existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.photo-portfolio.yml down

# Nettoyer les images non utilisées
Write-Host "🧹 Nettoyage des images Docker..." -ForegroundColor Yellow
docker image prune -f

# Construire les images
Write-Host "`n🔨 Construction des images Docker..." -ForegroundColor Yellow
docker-compose -f docker-compose.photo-portfolio.yml build --no-cache

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors de la construction des images" -ForegroundColor Red
    exit 1
}

# Démarrer les services
Write-Host "`n🚀 Démarrage des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.photo-portfolio.yml up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Erreur lors du démarrage des services" -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host "`n⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier le statut des services
Write-Host "`n📊 Vérification du statut des services..." -ForegroundColor Yellow
docker-compose -f docker-compose.photo-portfolio.yml ps

# Vérifier la santé des services
Write-Host "`n🏥 Vérification de la santé des services..." -ForegroundColor Yellow

Write-Host "Application Photo Portfolio:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3001/health" -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Application accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Application non accessible" -ForegroundColor Red
}

Write-Host "Redis:" -ForegroundColor Cyan
try {
    $redisResult = docker exec photo-portfolio-redis redis-cli ping
    if ($redisResult -eq "PONG") {
        Write-Host "✅ Redis accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Redis non accessible" -ForegroundColor Red
}

Write-Host "Nginx:" -ForegroundColor Cyan
try {
    $nginxResponse = Invoke-WebRequest -Uri "http://localhost/health" -TimeoutSec 10
    if ($nginxResponse.StatusCode -eq 200) {
        Write-Host "✅ Nginx accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Nginx non accessible" -ForegroundColor Red
}

# Afficher les logs
Write-Host "`n📋 Logs des services:" -ForegroundColor Yellow
Write-Host "====================" -ForegroundColor Yellow
docker-compose -f docker-compose.photo-portfolio.yml logs --tail=20

Write-Host "`n🎉 Déploiement terminé !" -ForegroundColor Green
Write-Host "========================" -ForegroundColor Green
Write-Host "📱 Application Photo Portfolio: http://localhost:3001" -ForegroundColor Cyan
Write-Host "🌐 Application via Nginx: http://localhost" -ForegroundColor Cyan
Write-Host "📊 Redis: localhost:6379" -ForegroundColor Cyan
Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor Yellow
Write-Host "  Voir les logs: docker-compose -f docker-compose.photo-portfolio.yml logs -f" -ForegroundColor White
Write-Host "  Arrêter: docker-compose -f docker-compose.photo-portfolio.yml down" -ForegroundColor White
Write-Host "  Redémarrer: docker-compose -f docker-compose.photo-portfolio.yml restart" -ForegroundColor White
Write-Host "  Statut: docker-compose -f docker-compose.photo-portfolio.yml ps" -ForegroundColor White

