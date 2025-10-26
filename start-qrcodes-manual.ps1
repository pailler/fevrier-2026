# Script pour démarrer le service QR codes manuellement
# Ce script lance le service Python directement sans Docker

Write-Host "🚀 Démarrage du service QR codes..." -ForegroundColor Cyan

# Vérifier que Python est installé
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire du service
Set-Location "C:\Users\AAA\Documents\iahome\essentiels\qrcodes\qr-code-service"

# Vérifier que les fichiers nécessaires existent
if (-not (Test-Path "qr_service.py")) {
    Write-Host "❌ Fichier qr_service.py non trouvé" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path "requirements.txt")) {
    Write-Host "❌ Fichier requirements.txt non trouvé" -ForegroundColor Red
    exit 1
}

# Installer les dépendances si nécessaire
Write-Host "📦 Installation des dépendances Python..." -ForegroundColor Yellow
try {
    pip install -r requirements.txt
    Write-Host "✅ Dépendances installées" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors de l'installation des dépendances: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Configurer les variables d'environnement pour la base de données
$env:DB_HOST = "localhost"
$env:DB_NAME = "qrcodes"
$env:DB_USER = "postgres"
$env:DB_PASSWORD = "password"
$env:DB_PORT = "5432"

Write-Host "🔧 Configuration de la base de données:" -ForegroundColor Cyan
Write-Host "   Host: $env:DB_HOST" -ForegroundColor Gray
Write-Host "   Database: $env:DB_NAME" -ForegroundColor Gray
Write-Host "   User: $env:DB_USER" -ForegroundColor Gray
Write-Host "   Port: $env:DB_PORT" -ForegroundColor Gray

# Démarrer le service
Write-Host "🚀 Démarrage du service sur le port 7005..." -ForegroundColor Cyan
Write-Host "📱 Interface web: http://localhost:7005" -ForegroundColor Green
Write-Host "🔗 API: http://localhost:7005/api/qr/dynamic" -ForegroundColor Green
Write-Host "⏹️ Appuyez sur Ctrl+C pour arrêter le service" -ForegroundColor Yellow

try {
    python qr_service.py
} catch {
    Write-Host "❌ Erreur lors du démarrage du service: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}













