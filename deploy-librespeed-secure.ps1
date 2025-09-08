# Script de déploiement pour LibreSpeed sécurisé avec OAuth2 Google
# Déploie librespeed.iahome.fr avec authentification Google

Write-Host "=== Déploiement de LibreSpeed sécurisé ===" -ForegroundColor Green

# Vérifier que Docker est en cours d'exécution
Write-Host "`n1. Vérification de Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✓ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "✗ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop et réessayer" -ForegroundColor Yellow
    exit 1
}

# Créer le réseau services-network s'il n'existe pas
Write-Host "`n2. Création du réseau Docker..." -ForegroundColor Yellow
try {
    docker network create services-network 2>$null
    Write-Host "✓ Réseau services-network créé ou existe déjà" -ForegroundColor Green
} catch {
    Write-Host "✓ Réseau services-network existe déjà" -ForegroundColor Green
}

# Arrêter les services existants
Write-Host "`n3. Arrêt des services existants..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml down 2>$null
docker-compose -f docker-services/docker-compose.services.yml down 2>$null
Write-Host "✓ Services arrêtés" -ForegroundColor Green

# Démarrer les services principaux
Write-Host "`n4. Démarrage des services principaux..." -ForegroundColor Yellow
docker-compose -f docker-compose.prod.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services principaux démarrés" -ForegroundColor Green
} else {
    Write-Host "✗ Erreur lors du démarrage des services principaux" -ForegroundColor Red
    exit 1
}

# Attendre que Traefik soit prêt
Write-Host "`n5. Attente de Traefik..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Démarrer les services externes
Write-Host "`n6. Démarrage des services externes..." -ForegroundColor Yellow
docker-compose -f docker-services/docker-compose.services.yml up -d
if ($LASTEXITCODE -eq 0) {
    Write-Host "✓ Services externes démarrés" -ForegroundColor Green
} else {
    Write-Host "✗ Erreur lors du démarrage des services externes" -ForegroundColor Red
    exit 1
}

# Attendre que tous les services soient prêts
Write-Host "`n7. Attente de la stabilisation des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 15

# Vérifier le statut des conteneurs
Write-Host "`n8. Vérification du statut des conteneurs..." -ForegroundColor Yellow

$requiredContainers = @(
    "iahome-app",
    "iahome-traefik", 
    "cloudflared",
    "iahome-oauth2-proxy",
    "librespeed"
)

$allRunning = $true
foreach ($container in $requiredContainers) {
    $status = docker ps --filter "name=$container" --format "{{.Names}}"
    if ($status -eq $container) {
        Write-Host "✓ $container est en cours d'exécution" -ForegroundColor Green
    } else {
        Write-Host "✗ $container n'est pas en cours d'exécution" -ForegroundColor Red
        $allRunning = $false
    }
}

if (-not $allRunning) {
    Write-Host "`n⚠️  Certains conteneurs ne sont pas en cours d'exécution" -ForegroundColor Yellow
    Write-Host "Vérifiez les logs avec: docker logs <nom_conteneur>" -ForegroundColor Yellow
}

# Afficher les informations de configuration
Write-Host "`n=== Configuration LibreSpeed sécurisé ===" -ForegroundColor Green
Write-Host "URL: https://librespeed.iahome.fr" -ForegroundColor Cyan
Write-Host "Authentification: Google OAuth2" -ForegroundColor Cyan
Write-Host "Proxy: OAuth2 Proxy" -ForegroundColor Cyan
Write-Host "Reverse Proxy: Traefik" -ForegroundColor Cyan
Write-Host "Tunnel: Cloudflared" -ForegroundColor Cyan

# Afficher les logs des services critiques
Write-Host "`n=== Logs des services critiques ===" -ForegroundColor Green
Write-Host "Pour surveiller les logs, utilisez:" -ForegroundColor Yellow
Write-Host "  docker logs iahome-oauth2-proxy -f" -ForegroundColor White
Write-Host "  docker logs librespeed -f" -ForegroundColor White
Write-Host "  docker logs iahome-traefik -f" -ForegroundColor White

Write-Host "`n=== Test de la configuration ===" -ForegroundColor Green
Write-Host "Exécutez le script de test:" -ForegroundColor Yellow
Write-Host "  .\test-librespeed-secure.ps1" -ForegroundColor White

Write-Host "`nDéploiement terminé!" -ForegroundColor Green




