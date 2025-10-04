# Script de démarrage pour LibreSpeed officiel
Write-Host "🚀 Démarrage de LibreSpeed officiel..." -ForegroundColor Cyan

# Vérifier si Node.js est disponible
try {
    $nodeVersion = node --version 2>&1
    Write-Host "✅ Node.js trouvé: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js non trouvé. Installation nécessaire." -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire LibreSpeed
if (!(Test-Path "librespeed-official")) {
    Write-Host "❌ Répertoire librespeed-official non trouvé" -ForegroundColor Red
    exit 1
}

Set-Location "librespeed-official"

# Vérifier si les fichiers nécessaires existent
$requiredFiles = @("index.html", "speedtest.js", "speedtest_worker.js", "server.js")
foreach ($file in $requiredFiles) {
    if (!(Test-Path $file)) {
        Write-Host "❌ Fichier manquant: $file" -ForegroundColor Red
        exit 1
    }
}

Write-Host "✅ Tous les fichiers nécessaires sont présents" -ForegroundColor Green

# Vérifier si le port 8081 est libre
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8081" -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop
    Write-Host "⚠️ Le port 8081 est déjà utilisé" -ForegroundColor Yellow
    Write-Host "🔄 Arrêt du service existant..." -ForegroundColor Yellow
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like "*server.js*" } | Stop-Process -Force
    Start-Sleep -Seconds 2
} catch {
    Write-Host "✅ Le port 8081 est libre" -ForegroundColor Green
}

# Démarrer le serveur LibreSpeed
Write-Host "`n🌐 Démarrage du serveur LibreSpeed officiel..." -ForegroundColor Yellow
Write-Host "📁 Répertoire: $(Get-Location)" -ForegroundColor Gray
Write-Host "🔗 URL locale: http://localhost:8081" -ForegroundColor Gray
Write-Host "🌍 URL publique: https://librespeed.iahome.fr" -ForegroundColor Gray
Write-Host "`n🚀 Serveur démarré! Appuyez sur Ctrl+C pour arrêter." -ForegroundColor Green

# Démarrer le serveur Node.js
node server.js



