# Script de démarrage pour Dashy
# IAHome Dashboard - Centre de contrôle centralisé

Write-Host "🚀 Démarrage de Dashy - IAHome Dashboard" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
Write-Host "Vérification de Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    Write-Host "Veuillez démarrer Docker Desktop et réessayer" -ForegroundColor Red
    exit 1
}

# Créer les dossiers nécessaires
Write-Host "Création des dossiers de données..." -ForegroundColor Yellow
$folders = @(
    "docker-services/dashy-data",
    "docker-services/dashy-icons", 
    "docker-services/dashy-backups"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "✅ Créé: $folder" -ForegroundColor Green
    } else {
        Write-Host "✅ Existe déjà: $folder" -ForegroundColor Green
    }
}

# Démarrer Dashy
Write-Host "Démarrage de Dashy..." -ForegroundColor Yellow
Set-Location "docker-services"
docker-compose -f docker-compose.dashy.yml up -d

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dashy démarré avec succès!" -ForegroundColor Green
    Write-Host ""
    Write-Host "🌐 Accès au dashboard:" -ForegroundColor Cyan
    Write-Host "   Local: http://localhost:8085" -ForegroundColor White
    Write-Host "   Domaine: https://dashboard.regispailler.fr" -ForegroundColor White
    Write-Host ""
    Write-Host "📊 Vérification du statut..." -ForegroundColor Yellow
    
    # Attendre que le service soit prêt
    Start-Sleep -Seconds 10
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8085" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Dashy est accessible et fonctionne correctement" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️  Dashy est en cours de démarrage, veuillez patienter..." -ForegroundColor Yellow
    }
    
} else {
    Write-Host "❌ Erreur lors du démarrage de Dashy" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Installation terminée!" -ForegroundColor Green
Write-Host "Dashy est maintenant votre centre de contrôle centralisé pour tous les services IAHome" -ForegroundColor Cyan
