#!/usr/bin/env pwsh

Write-Host "🚀 Démarrage de l'application en mode développement local..." -ForegroundColor Green

# Copier la configuration de développement
Write-Host "📋 Configuration de l'environnement de développement..." -ForegroundColor Yellow
Copy-Item "env.development.local" ".env.local" -Force

Write-Host "✅ Configuration copiée vers .env.local" -ForegroundColor Green

# Démarrer l'application Next.js
Write-Host "🌐 Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Mode: Développement" -ForegroundColor Cyan
Write-Host "   Configuration: env.development.local" -ForegroundColor Cyan
Write-Host ""

npm run dev



