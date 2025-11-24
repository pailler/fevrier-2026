# Script PowerShell pour démarrer Hunyuan3D avec Docker
Write-Host "🐳 Démarrage de Hunyuan3D avec Docker..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que Docker est en cours d'exécution
$dockerRunning = docker info 2>&1 | Out-Null
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas en cours d'exécution!" -ForegroundColor Red
    Write-Host "   Veuillez démarrer Docker Desktop" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
Write-Host ""

# Vérifier si le conteneur existe déjà
$existingContainer = docker ps -a --filter "name=hunyuan3d" --format "{{.Names}}"
if ($existingContainer -eq "hunyuan3d") {
    Write-Host "🔄 Conteneur existant trouvé" -ForegroundColor Yellow
    $running = docker ps --filter "name=hunyuan3d" --format "{{.Names}}"
    if ($running -eq "hunyuan3d") {
        Write-Host "   Le conteneur est déjà en cours d'exécution" -ForegroundColor Green
        Write-Host ""
        Write-Host "📊 Statut:" -ForegroundColor Cyan
        docker ps --filter "name=hunyuan3d" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
        Write-Host ""
        Write-Host "🌐 Interface accessible sur: http://localhost:8888" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "   Redémarrage du conteneur..." -ForegroundColor Yellow
        docker start hunyuan3d
        Start-Sleep -Seconds 5
    }
} else {
    Write-Host "🔨 Construction de l'image Docker..." -ForegroundColor Cyan
    Write-Host "   Cela peut prendre plusieurs minutes lors du premier build" -ForegroundColor Gray
    Write-Host ""
    
    # Vérifier si le réseau existe, sinon le créer ou utiliser standalone
    $networkExists = docker network ls --filter "name=iahome-network" --format "{{.Name}}"
    if ($networkExists -ne "iahome-network") {
        Write-Host "⚠️  Réseau iahome-network non trouvé" -ForegroundColor Yellow
        Write-Host "   Tentative de création..." -ForegroundColor Gray
        docker network create iahome-network 2>$null
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Réseau iahome-network créé" -ForegroundColor Green
            docker-compose up -d --build
        } else {
            Write-Host "   Utilisation du compose standalone (sans réseau externe)" -ForegroundColor Yellow
            docker-compose -f docker-compose.standalone.yml up -d --build
        }
    } else {
        Write-Host "✅ Réseau iahome-network trouvé" -ForegroundColor Green
        docker-compose up -d --build
    }
}

Write-Host ""
Write-Host "⏳ Attente du démarrage du service (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Vérifier l'état du conteneur
$containerStatus = docker ps --filter "name=hunyuan3d" --format "{{.Status}}"
if ($containerStatus) {
    Write-Host "✅ Conteneur démarré: $containerStatus" -ForegroundColor Green
} else {
    Write-Host "⚠️  Conteneur non trouvé ou arrêté" -ForegroundColor Yellow
    Write-Host "   Vérification des logs..." -ForegroundColor Gray
    docker-compose logs --tail=20 hunyuan3d
}

Write-Host ""
Write-Host "🔍 Vérification de l'accessibilité..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Interface Gradio accessible sur http://localhost:8888" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Service non encore accessible" -ForegroundColor Yellow
    Write-Host "   Le chargement des modèles peut prendre 5-15 minutes" -ForegroundColor Gray
    Write-Host "   Vérifiez les logs avec: docker-compose logs -f hunyuan3d" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📊 Commandes utiles:" -ForegroundColor Cyan
Write-Host "   • Voir les logs: docker-compose logs -f hunyuan3d" -ForegroundColor White
Write-Host "   • Arrêter: docker-compose down" -ForegroundColor White
Write-Host "   • Redémarrer: docker-compose restart" -ForegroundColor White
Write-Host "   • Statut: docker-compose ps" -ForegroundColor White
Write-Host ""
Write-Host "🌐 URLs d'accès:" -ForegroundColor Cyan
Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
Write-Host ""

