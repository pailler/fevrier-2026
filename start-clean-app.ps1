#!/usr/bin/env pwsh

Write-Host "🧹 Démarrage propre de l'application..." -ForegroundColor Green

# Arrêter tous les processus Node.js
Write-Host "🛑 Arrêt de tous les processus Node.js..." -ForegroundColor Yellow
Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Attendre que les processus se terminent
Start-Sleep -Seconds 3

# Vérifier que le port 3000 est libre
Write-Host "🔍 Vérification que le port 3000 est libre..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "   ❌ Le port 3000 est encore utilisé" -ForegroundColor Red
    Write-Host "   💡 Redémarrez PowerShell en tant qu'administrateur" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   ✅ Port 3000 libre" -ForegroundColor Green
}

# Copier la configuration de développement
Write-Host "📋 Configuration de l'environnement..." -ForegroundColor Yellow
if (Test-Path "env.development.local") {
    Copy-Item "env.development.local" ".env.local" -Force
    Write-Host "   ✅ Configuration de développement copiée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Fichier env.development.local non trouvé" -ForegroundColor Yellow
}

# Nettoyer le cache Next.js
Write-Host "🧹 Nettoyage du cache Next.js..." -ForegroundColor Yellow
if (Test-Path ".next") {
    Remove-Item ".next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   ✅ Cache Next.js supprimé" -ForegroundColor Green
}

# Démarrer l'application
Write-Host "🌐 Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Mode: Développement avec middleware simplifié" -ForegroundColor Cyan
Write-Host "   Système: Authentification personnalisée fonctionnelle" -ForegroundColor Cyan
Write-Host ""

npm run dev






