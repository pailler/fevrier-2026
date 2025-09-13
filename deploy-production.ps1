# Script de déploiement en production pour iahome.fr (Windows PowerShell)
Write-Host "🚀 Déploiement en production pour iahome.fr..." -ForegroundColor Green

# Arrêter les processus existants
Write-Host "⏹️ Arrêt des processus existants..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Nettoyer le cache
Write-Host "🧹 Nettoyage du cache..." -ForegroundColor Yellow
if (Test-Path ".next") { Remove-Item -Recurse -Force ".next" }
if (Test-Path "node_modules\.cache") { Remove-Item -Recurse -Force "node_modules\.cache" }

# Installer les dépendances
Write-Host "📦 Installation des dépendances..." -ForegroundColor Yellow
npm ci --production

# Build en mode production
Write-Host "🔨 Build en mode production..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
npm run build

# Vérifier que le build a réussi
if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build réussi !" -ForegroundColor Green
    
    # Démarrer en mode production
    Write-Host "🚀 Démarrage en mode production..." -ForegroundColor Green
    $env:NODE_ENV = "production"
    Start-Process -NoNewWindow -FilePath "npm" -ArgumentList "run", "start"
    
    # Attendre que le serveur démarre
    Start-Sleep -Seconds 5
    
    # Vérifier que le serveur répond
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:3000" -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "✅ Serveur de production démarré avec succès sur https://iahome.fr" -ForegroundColor Green
            Write-Host "🌐 Site accessible sur : https://iahome.fr" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "❌ Erreur : Le serveur ne répond pas" -ForegroundColor Red
        exit 1
    }
}
else {
    Write-Host "❌ Erreur lors du build" -ForegroundColor Red
    exit 1
}

Write-Host "🎉 Déploiement terminé !" -ForegroundColor Green

