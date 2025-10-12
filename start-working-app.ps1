#!/usr/bin/env pwsh

Write-Host "🚀 Démarrage de l'application avec le système d'authentification qui fonctionne..." -ForegroundColor Green

# Arrêter tous les processus sur le port 3000
Write-Host "🛑 Arrêt des processus existants sur le port 3000..." -ForegroundColor Yellow
$processes = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique
foreach ($pid in $processes) {
    try {
        Stop-Process -Id $pid -Force -ErrorAction SilentlyContinue
        Write-Host "   ✅ Processus $pid arrêté" -ForegroundColor Green
    } catch {
        Write-Host "   ⚠️ Impossible d'arrêter le processus $pid" -ForegroundColor Yellow
    }
}

# Attendre que le port soit libéré
Start-Sleep -Seconds 2

# Copier la configuration de développement
Write-Host "📋 Configuration de l'environnement..." -ForegroundColor Yellow
if (Test-Path "env.development.local") {
    Copy-Item "env.development.local" ".env.local" -Force
    Write-Host "   ✅ Configuration de développement copiée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️ Fichier env.development.local non trouvé, utilisation de la configuration par défaut" -ForegroundColor Yellow
}

# Vérifier que le port est libre
Write-Host "🔍 Vérification que le port 3000 est libre..." -ForegroundColor Yellow
$portCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($portCheck) {
    Write-Host "   ❌ Le port 3000 est encore utilisé" -ForegroundColor Red
    Write-Host "   💡 Redémarrez PowerShell en tant qu'administrateur et relancez ce script" -ForegroundColor Yellow
    exit 1
} else {
    Write-Host "   ✅ Port 3000 libre" -ForegroundColor Green
}

# Démarrer l'application Next.js
Write-Host "🌐 Démarrage du serveur de développement..." -ForegroundColor Yellow
Write-Host "   URL: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Mode: Développement avec authentification personnalisée" -ForegroundColor Cyan
Write-Host "   Système: Contourne Supabase Auth pour éviter les erreurs" -ForegroundColor Cyan
Write-Host ""

npm run dev









