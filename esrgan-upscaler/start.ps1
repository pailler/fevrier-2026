# Script de démarrage pour l'application ESRGAN Upscaler
# Trouve un port libre et démarre l'application

Write-Host "🚀 Démarrage de l'application ESRGAN Upscaler" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Cyan

# Vérifier si Python est installé
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✓ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "✗ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Vérifier si les dépendances sont installées
Write-Host "`n📦 Vérification des dépendances..." -ForegroundColor Cyan
try {
    python -c "import flask" 2>$null
    Write-Host "✓ Flask installé" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Installation des dépendances..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Vérifier que les modèles existent
$modelsPath = "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\ESRGAN"
$model1 = "$modelsPath\4xUltrasharp_4xUltrasharpV10.pt"
$model2 = "$modelsPath\fixYourBlurHires_4xUltra4xAnimeSharp.zip"

Write-Host "`n📁 Vérification des modèles..." -ForegroundColor Cyan
if (Test-Path $model1) {
    Write-Host "✓ Modèle UltraSharp trouvé" -ForegroundColor Green
} else {
    Write-Host "✗ Modèle UltraSharp non trouvé: $model1" -ForegroundColor Red
}

if (Test-Path $model2) {
    Write-Host "✓ Modèle Anime trouvé" -ForegroundColor Green
} else {
    Write-Host "✗ Modèle Anime non trouvé: $model2" -ForegroundColor Red
}

# Trouver un port libre
Write-Host "`n🔍 Recherche d'un port libre..." -ForegroundColor Cyan
$startPort = 8888
$port = $startPort
$found = $false

for ($i = 0; $i -lt 100; $i++) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if (-not $connection) {
        $found = $true
        break
    }
    $port++
}

if (-not $found) {
    Write-Host "✗ Aucun port libre trouvé entre $startPort et $($startPort + 100)" -ForegroundColor Red
    exit 1
}

Write-Host "✓ Port libre trouvé: $port" -ForegroundColor Green

# Démarrer l'application
Write-Host "`n🌐 Démarrage de l'application sur le port $port..." -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan
Write-Host ""

# Définir la variable d'environnement pour le port
$env:FLASK_PORT = $port

# Démarrer Flask
python app.py
