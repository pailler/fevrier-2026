# Script PowerShell pour démarrer l'application localement

Write-Host "🎬 Démarrage de l'application d'animation de photos..." -ForegroundColor Cyan

# Vérifier si Python est installé
if (-not (Get-Command python -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Python n'est pas installé. Veuillez installer Python 3.8 ou supérieur." -ForegroundColor Red
    exit 1
}

# Vérifier la version de Python
$pythonVersion = python --version
Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green

# Vérifier si les dépendances sont installées
Write-Host "📦 Vérification des dépendances..." -ForegroundColor Yellow
try {
    python -c "import gradio" 2>$null
    Write-Host "✅ Gradio est installé" -ForegroundColor Green
} catch {
    Write-Host "⚠️  Installation des dépendances..." -ForegroundColor Yellow
    pip install -r requirements.txt
}

# Démarrer l'application
Write-Host "🚀 Lancement de l'application..." -ForegroundColor Cyan
if (-not $env:PHOTOBOOTH_PORT) { $env:PHOTOBOOTH_PORT = "7885" }
Write-Host "📍 L'application sera accessible sur http://localhost:$($env:PHOTOBOOTH_PORT)" -ForegroundColor Green
Write-Host ""

python app.py
