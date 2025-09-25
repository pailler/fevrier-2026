# Script PowerShell pour démarrer le service QR codes dédié

Write-Host "🚀 Démarrage du service QR codes dédié..." -ForegroundColor Yellow
Write-Host "=========================================" -ForegroundColor Yellow

# Vérifier si Docker est disponible
if (!(Get-Command docker -ErrorAction SilentlyContinue)) {
    Write-Host "❌ Docker n'est pas installé ou n'est pas dans le PATH" -ForegroundColor Red
    exit 1
}

# Aller dans le répertoire du service
Set-Location "qr-codes-service"

Write-Host "📦 Installation des dépendances..." -ForegroundColor Cyan
npm install

Write-Host "🐳 Construction de l'image Docker..." -ForegroundColor Cyan
docker build -t qr-codes-service .

Write-Host "🚀 Démarrage du service sur le port 7012..." -ForegroundColor Green
docker-compose up -d

Write-Host "⏳ Attente du démarrage..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🔍 Test du service..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "http://localhost:7012/health" -Method GET -TimeoutSec 5
    Write-Host "✅ Service QR codes: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Service QR codes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Configuration Cloudflare requise:" -ForegroundColor Green
Write-Host "1. Connectez-vous à Cloudflare Dashboard" -ForegroundColor White
Write-Host "2. Allez dans Zero Trust > Access > Tunnels" -ForegroundColor White
Write-Host "3. Sélectionnez le tunnel 'iahome-new'" -ForegroundColor White
Write-Host "4. Cliquez sur 'Configure' dans la section 'Public Hostname'" -ForegroundColor White
Write-Host "5. Modifiez l'entrée pour 'qrcodes.iahome.fr'" -ForegroundColor White
Write-Host "6. Changez le service de 'http://192.168.1.150:7005' vers 'http://192.168.1.150:7012'" -ForegroundColor White
Write-Host "7. Laissez le champ 'Chemin d'accès' VIDE" -ForegroundColor White
Write-Host "8. Sauvegardez les modifications" -ForegroundColor White

Write-Host ""
Write-Host "✅ Service QR codes prêt sur le port 7012 !" -ForegroundColor Green
Write-Host "• URL locale: http://localhost:7012" -ForegroundColor Gray
Write-Host "• URL Cloudflare: https://qrcodes.iahome.fr (après configuration)" -ForegroundColor Gray
Write-Host "• Affichage utilisateur connecté intégré" -ForegroundColor Gray
