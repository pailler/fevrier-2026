# Script pour redémarrer le serveur Next.js

Write-Host "🔄 Redémarrage du serveur Next.js..." -ForegroundColor Cyan

# 1. Arrêter tous les processus Node.js
Write-Host "`n1. Arrêt des processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Trouvé $($nodeProcesses.Count) processus Node.js" -ForegroundColor Gray
    $nodeProcesses | Stop-Process -Force
    Write-Host "   ✅ Processus Node.js arrêtés" -ForegroundColor Green
    Start-Sleep -Seconds 2
} else {
    Write-Host "   ℹ️ Aucun processus Node.js trouvé" -ForegroundColor Gray
}

# 2. Vérifier que le port 3000 est libre
Write-Host "`n2. Vérification du port 3000..." -ForegroundColor Yellow
$port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
if ($port3000) {
    Write-Host "   ⚠️ Le port 3000 est encore utilisé" -ForegroundColor Yellow
    Write-Host "   Tentative de libération..." -ForegroundColor Gray
    Start-Sleep -Seconds 3
    $port3000 = netstat -ano | findstr ":3000" | findstr "LISTENING"
    if ($port3000) {
        Write-Host "   ❌ Le port 3000 est toujours utilisé" -ForegroundColor Red
        Write-Host "   Tu devras peut-être redémarrer manuellement" -ForegroundColor Yellow
    } else {
        Write-Host "   ✅ Port 3000 libéré" -ForegroundColor Green
    }
} else {
    Write-Host "   ✅ Port 3000 libre" -ForegroundColor Green
}

# 3. Se déplacer dans le répertoire du projet
Write-Host "`n3. Déplacement dans le répertoire du projet..." -ForegroundColor Yellow
$projectPath = "C:\Users\AAA\Documents\iahome"
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "   ✅ Répertoire: $projectPath" -ForegroundColor Green
} else {
    Write-Host "   ❌ Répertoire non trouvé: $projectPath" -ForegroundColor Red
    exit 1
}

# 4. Vérifier que package.json existe
Write-Host "`n4. Vérification de package.json..." -ForegroundColor Yellow
if (Test-Path "package.json") {
    Write-Host "   ✅ package.json trouvé" -ForegroundColor Green
} else {
    Write-Host "   ❌ package.json non trouvé" -ForegroundColor Red
    exit 1
}

# 5. Redémarrer le serveur
Write-Host "`n5. Démarrage du serveur Next.js..." -ForegroundColor Yellow
Write-Host "   Commande: npm run dev" -ForegroundColor Gray
Write-Host "   ⚠️ Le serveur va démarrer dans un nouveau terminal" -ForegroundColor Yellow
Write-Host "   Tu pourras voir les logs dans ce terminal" -ForegroundColor Gray

# Démarrer dans un nouveau terminal PowerShell
Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; npm run dev"

Write-Host "`n✅ Commande de démarrage lancée!" -ForegroundColor Green
Write-Host "`n⏳ Attente de 10 secondes pour que le serveur démarre..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 6. Tester l'accessibilité locale
Write-Host "`n6. Test d'accessibilité locale..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Serveur accessible sur http://localhost:3000" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Serveur répond avec le code: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Serveur pas encore prêt (normal, peut prendre 30-60 secondes)" -ForegroundColor Yellow
    Write-Host "   Vérifie le terminal où tourne npm run dev pour voir les logs" -ForegroundColor Gray
}

# 7. Vérifier le tunnel Cloudflare
Write-Host "`n7. Vérification du tunnel Cloudflare..." -ForegroundColor Yellow
try {
    $tunnelInfo = cloudflared tunnel info iahome-new 2>&1
    if ($tunnelInfo -match "CONNECTOR ID") {
        Write-Host "   ✅ Tunnel Cloudflare actif" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Tunnel Cloudflare non actif" -ForegroundColor Yellow
        Write-Host "   Lance: .\start-cloudflare-tunnel.ps1" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️ Impossible de vérifier le tunnel (cloudflared peut ne pas être dans le PATH)" -ForegroundColor Yellow
}

Write-Host "`n🎉 Redémarrage terminé!" -ForegroundColor Green
Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Cyan
Write-Host "   1. Vérifie le terminal où tourne npm run dev" -ForegroundColor White
Write-Host "   2. Attends que le serveur soit complètement démarré (30-60 secondes)" -ForegroundColor White
Write-Host "   3. Teste localement: http://localhost:3000" -ForegroundColor White
Write-Host "   4. Teste via Cloudflare: https://iahome.fr (après 1-2 minutes)" -ForegroundColor White



