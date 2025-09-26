Write-Host "🚀 Démarrage du serveur d'authentification MeTube..." -ForegroundColor Green

# Installer express si nécessaire
if (!(Test-Path "node_modules")) {
    Write-Host "📦 Installation d'Express..." -ForegroundColor Yellow
    npm init -y
    npm install express
}

# Démarrer le serveur
Write-Host "🔐 Démarrage du serveur d'authentification..." -ForegroundColor Cyan
Write-Host "• Page d'identification: http://localhost:8085" -ForegroundColor White
Write-Host "• MeTube direct: http://192.168.1.150:8081" -ForegroundColor White

node metube-auth-server.js
