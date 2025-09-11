# Script de test Docker - Portfolio Photo IA
# Usage: .\test-docker.ps1

Write-Host "🧪 Test de configuration Docker - Portfolio Photo IA" -ForegroundColor Blue
Write-Host ""

# Vérifier Docker
Write-Host "1. Vérification de Docker..." -ForegroundColor Yellow
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker installé" -ForegroundColor Green
    docker --version
} else {
    Write-Host "❌ Docker non installé" -ForegroundColor Red
    exit 1
}

# Vérifier Docker Compose
Write-Host ""
Write-Host "2. Vérification de Docker Compose..." -ForegroundColor Yellow
if (Get-Command docker-compose -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker Compose installé" -ForegroundColor Green
    docker-compose --version
} else {
    Write-Host "❌ Docker Compose non installé" -ForegroundColor Red
    exit 1
}

# Vérifier les fichiers de configuration
Write-Host ""
Write-Host "3. Vérification des fichiers de configuration..." -ForegroundColor Yellow

$files = @(
    "Dockerfile.photo-portfolio",
    "docker-compose.photo-portfolio.yml",
    "nginx/photo-portfolio.conf",
    "env.docker.example"
)

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "✅ $file" -ForegroundColor Green
    } else {
        Write-Host "❌ $file manquant" -ForegroundColor Red
    }
}

# Test de construction de l'image
Write-Host ""
Write-Host "4. Test de construction de l'image..." -ForegroundColor Yellow

try {
    Write-Host "Construction de l'image de test..."
    docker-compose -f test-docker-config.yml build --no-cache
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Image construite avec succès" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors de la construction" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors de la construction: $($_.Exception.Message)" -ForegroundColor Red
}

# Nettoyage
Write-Host ""
Write-Host "5. Nettoyage..." -ForegroundColor Yellow
docker-compose -f test-docker-config.yml down 2>$null
docker rmi iahome-photo-portfolio-test 2>$null

Write-Host ""
Write-Host "🎉 Test terminé !" -ForegroundColor Green
Write-Host ""
Write-Host "Pour déployer l'application :" -ForegroundColor Blue
Write-Host "1. Configurer .env.local avec vos variables" -ForegroundColor White
Write-Host "2. Exécuter: .\deploy-docker-photo-portfolio.ps1 start" -ForegroundColor White
