Write-Host "🚀 Démarrage du proxy d'authentification MeTube..." -ForegroundColor Green

# Aller dans le dossier du proxy
cd metube-auth-proxy

# Installer les dépendances si nécessaire
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
    npm install
}

# Démarrer le serveur
Write-Host "🔐 Démarrage du proxy d'authentification..." -ForegroundColor Cyan
Write-Host "• Page d'identification: http://localhost:8084" -ForegroundColor White
Write-Host "• MeTube (après auth): http://localhost:8084/metube" -ForegroundColor White
Write-Host "• MeTube direct: http://192.168.1.150:8081" -ForegroundColor White

node simple-server.js
