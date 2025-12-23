# Script PowerShell pour démarrer apprendre-autrement avec Docker

Write-Host "🚀 Démarrage de apprendre-autrement..." -ForegroundColor Green

# Vérifier si Docker est installé
if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé. Veuillez installer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier si Docker Compose est disponible
if (-not (Get-Command docker-compose -ErrorAction SilentlyContinue)) {
    Write-Host "⚠️  docker-compose n'est pas disponible, utilisation de 'docker compose'..." -ForegroundColor Yellow
    $composeCmd = "docker compose"
} else {
    $composeCmd = "docker-compose"
}

# Construire et démarrer les conteneurs
Write-Host "📦 Construction et démarrage des conteneurs..." -ForegroundColor Cyan
& $composeCmd.Split(' ') up -d --build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Application démarrée avec succès !" -ForegroundColor Green
    Write-Host "🌐 Accédez à l'application sur http://localhost:9001" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour voir les logs : $composeCmd logs -f" -ForegroundColor Yellow
    Write-Host "Pour arrêter : $composeCmd down" -ForegroundColor Yellow
} else {
    Write-Host "❌ Erreur lors du démarrage" -ForegroundColor Red
    exit 1
}





