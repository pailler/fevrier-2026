# QR Link Manager - Script de démarrage PowerShell
Write-Host "🚀 Démarrage de QR Link Manager..." -ForegroundColor Green

# Vérifier si Docker est installé
try {
    docker --version | Out-Null
    Write-Host "✅ Docker détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier si Docker Compose est installé
try {
    docker-compose --version | Out-Null
    Write-Host "✅ Docker Compose détecté" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker Compose n'est pas installé. Veuillez installer Docker Compose d'abord." -ForegroundColor Red
    exit 1
}

# Vérifier si le fichier .env existe
if (-not (Test-Path ".env")) {
    Write-Host "📝 Création du fichier .env..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env"
    Write-Host "⚠️  Veuillez configurer le fichier .env avant de continuer." -ForegroundColor Yellow
    Write-Host "   Vous pouvez éditer le fichier .env avec vos paramètres." -ForegroundColor Yellow
    Read-Host "Appuyez sur Entrée pour continuer..."
}

# Construire et démarrer les services
Write-Host "🔨 Construction des images Docker..." -ForegroundColor Blue
docker-compose build

Write-Host "🚀 Démarrage des services..." -ForegroundColor Blue
docker-compose up -d

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier l'état des services
Write-Host "📊 État des services:" -ForegroundColor Cyan
docker-compose ps

# Afficher les URLs d'accès
Write-Host ""
Write-Host "✅ QR Link Manager est maintenant démarré!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 URLs d'accès:" -ForegroundColor White
Write-Host "   Frontend: http://localhost:7000" -ForegroundColor Cyan
Write-Host "   API: http://localhost:7001" -ForegroundColor Cyan
Write-Host "   Redirection: http://localhost:7002" -ForegroundColor Cyan
Write-Host "   Santé API: http://localhost:7001/health" -ForegroundColor Cyan
Write-Host ""
Write-Host "📝 Compte par défaut:" -ForegroundColor White
Write-Host "   Email: admin@qrlink.com" -ForegroundColor Yellow
Write-Host "   Mot de passe: admin123" -ForegroundColor Yellow
Write-Host ""
Write-Host "📋 Commandes utiles:" -ForegroundColor White
Write-Host "   Voir les logs: docker-compose logs -f" -ForegroundColor Gray
Write-Host "   Arrêter: docker-compose down" -ForegroundColor Gray
Write-Host "   Redémarrer: docker-compose restart" -ForegroundColor Gray
Write-Host ""
