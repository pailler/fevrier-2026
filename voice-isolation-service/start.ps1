# Script PowerShell pour démarrer le service d'isolation vocale

Write-Host "🎤 Démarrage du service d'isolation vocale (Gradio + Demucs)..." -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
$dockerRunning = docker info 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Docker n'est pas en cours d'exécution" -ForegroundColor Red
    exit 1
}

# Vérifier si les réseaux existent
Write-Host "🔍 Vérification des réseaux Docker..." -ForegroundColor Yellow
$whisperNetwork = docker network ls | Select-String "whisper-network"
$iahomeNetwork = docker network ls | Select-String "iahome-network"

if (-not $whisperNetwork) {
    Write-Host "📦 Création du réseau whisper-network..." -ForegroundColor Yellow
    docker network create whisper-network
}

if (-not $iahomeNetwork) {
    Write-Host "📦 Création du réseau iahome-network..." -ForegroundColor Yellow
    docker network create iahome-network
}

# Construire et démarrer le service
Write-Host "🔨 Construction de l'image Docker..." -ForegroundColor Yellow
docker-compose build

Write-Host "🚀 Démarrage du service..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "✅ Service démarré sur http://localhost:8100" -ForegroundColor Green
Write-Host "⏳ Le modèle Demucs peut prendre 2-3 minutes à charger au premier démarrage..." -ForegroundColor Yellow
Write-Host "📊 Vérification de la santé du service..." -ForegroundColor Cyan

# Attendre que le service soit prêt
$maxAttempts = 30
$attempt = 0
$serviceReady = $false

while ($attempt -lt $maxAttempts -and -not $serviceReady) {
    Start-Sleep -Seconds 5
    $attempt++
    
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8100/" -TimeoutSec 5 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $serviceReady = $true
            Write-Host "✅ Service opérationnel!" -ForegroundColor Green
        }
    } catch {
        Write-Host "⏳ Tentative $attempt/$maxAttempts - Service en cours de démarrage..." -ForegroundColor Gray
    }
}

if (-not $serviceReady) {
    Write-Host "⚠️ Le service démarre mais n'est pas encore prêt. Vérifiez les logs avec:" -ForegroundColor Yellow
    Write-Host "   docker logs voice-isolation-service" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "🎉 Application prête!" -ForegroundColor Green
    Write-Host "   URL: http://localhost:8100" -ForegroundColor Cyan
    Write-Host "   Interface: Gradio (similaire à Hugging Face Spaces)" -ForegroundColor Cyan
}
