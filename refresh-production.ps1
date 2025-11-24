# Script pour rafraîchir la production et voir les modifications

Write-Host "🔄 RAFRAÎCHISSEMENT DE LA PRODUCTION" -ForegroundColor Cyan
Write-Host "====================================`n" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêter Next.js
Write-Host "1️⃣ Arrêt de Next.js..." -ForegroundColor Yellow
$nextjsProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    (Get-NetTCPConnection -OwningProcess $_.Id -ErrorAction SilentlyContinue | Where-Object LocalPort -eq 3000) -or
    $_.CommandLine -like "*next*"
}
if ($nextjsProcesses) {
    Write-Host "   ⏹️  Arrêt de $($nextjsProcesses.Count) processus Next.js..." -ForegroundColor Gray
    $nextjsProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt du processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   ✅ Next.js arrêté" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus Next.js à arrêter" -ForegroundColor Green
}

# 2. Nettoyer les caches
Write-Host "`n2️⃣ Nettoyage des caches..." -ForegroundColor Yellow
$cacheDirs = @(".next", ".next/cache", "node_modules/.cache")
foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "   🗑️  Suppression de $dir..." -ForegroundColor Gray
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ $dir supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erreur lors de la suppression de $dir : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
}

# 3. Reconstruire l'application
Write-Host "`n3️⃣ Reconstruction de l'application..." -ForegroundColor Yellow
$buildId = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "   📋 Build ID: $buildId" -ForegroundColor Gray
Write-Host "   🚀 Lancement du build..." -ForegroundColor Gray

$env:BUILD_ID = $buildId
$env:NODE_ENV = "production"

try {
    $buildOutput = npm run build 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build réussi!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du build" -ForegroundColor Red
        Write-Host "   📋 Détails:" -ForegroundColor Cyan
        Write-Host $buildOutput -ForegroundColor Gray
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 4. Vérifier les fichiers statiques
Write-Host "`n4️⃣ Vérification des fichiers statiques..." -ForegroundColor Yellow
$staticDirs = @(".next/static", ".next/static/chunks", ".next/static/css")
$allPresent = $true
foreach ($dir in $staticDirs) {
    if (Test-Path $dir) {
        $fileCount = (Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue).Count
        Write-Host "   ✅ $dir : $fileCount fichiers" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir : MANQUANT!" -ForegroundColor Red
        $allPresent = $false
    }
}

# 5. Redémarrer Next.js en production
Write-Host "`n5️⃣ Redémarrage de Next.js en mode production..." -ForegroundColor Yellow
Write-Host "   🚀 Lancement sur http://localhost:3000..." -ForegroundColor Gray

$env:NODE_ENV = "production"
$env:PORT = "3000"

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:NODE_ENV='production'; `$env:PORT='3000'; npm start" -WindowStyle Minimized
    Start-Sleep -Seconds 10
    
    # Vérifier que Next.js répond
    $maxRetries = 6
    $retryCount = 0
    $isRunning = $false
    
    while ($retryCount -lt $maxRetries -and -not $isRunning) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $isRunning = $true
                Write-Host "   ✅ Next.js répond : HTTP $($response.StatusCode)" -ForegroundColor Green
            }
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "   ⏳ Attente du démarrage... ($retryCount/$maxRetries)" -ForegroundColor Gray
                Start-Sleep -Seconds 5
            }
        }
    }
    
    if (-not $isRunning) {
        Write-Host "   ⚠️  Next.js ne répond pas encore (peut prendre quelques secondes)" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez manuellement : http://localhost:3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage de Next.js: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Instructions pour vider le cache du navigateur
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Caches nettoyés" -ForegroundColor Green
Write-Host "   ✅ Application reconstruite (Build ID: $buildId)" -ForegroundColor Green
Write-Host "   ✅ Next.js redémarré en mode production" -ForegroundColor Green
Write-Host "`n💡 POUR VOIR LES MODIFICATIONS:" -ForegroundColor Yellow
Write-Host "   1. Videz le cache de votre navigateur :" -ForegroundColor Gray
Write-Host "      - Chrome/Edge : Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "      - Firefox : Ctrl+Shift+Delete" -ForegroundColor Gray
Write-Host "      - Ou utilisez Ctrl+Shift+R pour un rechargement forcé" -ForegroundColor Gray
Write-Host "   2. Videz le cache Cloudflare si nécessaire" -ForegroundColor Gray
Write-Host "   3. Testez sur : http://localhost:3000" -ForegroundColor Gray
Write-Host "   4. Testez sur : https://iahome.fr" -ForegroundColor Gray
Write-Host ""

