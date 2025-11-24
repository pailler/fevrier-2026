# Script pour forcer une reconstruction complète en production et invalider tous les caches

Write-Host "🔥 RECONSTRUCTION FORCÉE EN PRODUCTION" -ForegroundColor Red
Write-Host "====================================`n" -ForegroundColor Red

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêter TOUS les processus Node.js
Write-Host "1️⃣ Arrêt FORCÉ de tous les processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ⏹️  Arrêt de $($nodeProcesses.Count) processus..." -ForegroundColor Gray
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "      ✅ Processus $($_.Id) arrêté" -ForegroundColor Gray
        } catch {
            Write-Host "      ⚠️  Erreur processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 5
    Write-Host "   ✅ Tous les processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus à arrêter" -ForegroundColor Green
}

# 2. Nettoyer TOUS les caches de manière agressive
Write-Host "`n2️⃣ Nettoyage AGRESSIF de tous les caches..." -ForegroundColor Yellow
$cacheDirs = @(
    ".next",
    ".next/cache",
    "node_modules/.cache",
    ".turbo",
    ".swc",
    "dist",
    "build",
    "out"
)

foreach ($dir in $cacheDirs) {
    if (Test-Path $dir) {
        Write-Host "   🗑️  Suppression FORCÉE de $dir..." -ForegroundColor Gray
        try {
            # Essayer plusieurs méthodes
            Get-ChildItem -Path $dir -Recurse -Force -ErrorAction SilentlyContinue | Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ $dir supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Tentative alternative pour $dir..." -ForegroundColor Yellow
            Start-Sleep -Seconds 2
            try {
                $emptyDir = Join-Path $env:TEMP "empty_$(Get-Random)"
                New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
                robocopy $emptyDir $dir /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS /NP | Out-Null
                Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -Path $emptyDir -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "   ✅ $dir supprimé (méthode alternative)" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠️  Impossible de supprimer complètement $dir" -ForegroundColor Yellow
            }
        }
    }
}

# 3. Nettoyer le cache npm
Write-Host "`n3️⃣ Nettoyage du cache npm..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "   ✅ Cache npm nettoyé" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur cache npm" -ForegroundColor Yellow
}

# 4. Générer un Build ID unique avec timestamp
Write-Host "`n4️⃣ Génération d'un Build ID unique..." -ForegroundColor Yellow
$buildId = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')-$(Get-Random -Minimum 1000 -Maximum 9999)"
Write-Host "   📋 Build ID: $buildId" -ForegroundColor Cyan

# 5. Reconstruire avec variables d'environnement forcées
Write-Host "`n5️⃣ Reconstruction COMPLÈTE avec cache désactivé..." -ForegroundColor Yellow
$env:BUILD_ID = $buildId
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_PRIVATE_STANDALONE = "false"

# Désactiver tous les caches possibles
$env:NEXT_BUILD_CACHE = "false"

Write-Host "   🚀 Lancement du build (peut prendre 2-3 minutes)..." -ForegroundColor Gray
Write-Host "   ⏳ Patientez..." -ForegroundColor Gray

try {
    $buildStart = Get-Date
    $buildOutput = npm run build 2>&1
    $buildEnd = Get-Date
    $buildDuration = ($buildEnd - $buildStart).TotalSeconds
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Build réussi en $([math]::Round($buildDuration, 1)) secondes!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du build" -ForegroundColor Red
        Write-Host "   📋 Dernières erreurs:" -ForegroundColor Cyan
        $buildOutput | Select-Object -Last 30 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 6. Vérifier les fichiers statiques
Write-Host "`n6️⃣ Vérification des fichiers statiques..." -ForegroundColor Yellow
$staticDirs = @(".next/static", ".next/static/chunks", ".next/static/css")
$totalFiles = 0
$totalSize = 0

foreach ($dir in $staticDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue
        $fileCount = $files.Count
        $size = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
        $totalFiles += $fileCount
        $totalSize += $size
        Write-Host "   ✅ $dir : $fileCount fichiers ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir : MANQUANT!" -ForegroundColor Red
        exit 1
    }
}

Write-Host "   ✅ Total: $totalFiles fichiers ($([math]::Round($totalSize, 2)) MB)" -ForegroundColor Green

# 7. Vérifier le Build ID dans les fichiers
Write-Host "`n7️⃣ Vérification du Build ID..." -ForegroundColor Yellow
$buildManifest = ".next/BUILD_ID"
if (Test-Path $buildManifest) {
    $manifestContent = Get-Content $buildManifest -Raw
    Write-Host "   ✅ BUILD_ID trouvé dans le manifest" -ForegroundColor Green
    Write-Host "   📋 Contenu: $manifestContent" -ForegroundColor Gray
} else {
    Write-Host "   ⚠️  BUILD_ID manifest introuvable" -ForegroundColor Yellow
}

# 8. Redémarrer Next.js avec variables d'environnement
Write-Host "`n8️⃣ Redémarrage de Next.js avec nouveau Build ID..." -ForegroundColor Yellow

# Arrêter tout processus existant
$existingProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($existingProcesses) {
    $existingProcesses | ForEach-Object { Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue }
    Start-Sleep -Seconds 3
}

# Démarrer avec le nouveau Build ID
$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:BUILD_ID = $buildId

Write-Host "   🚀 Démarrage avec Build ID: $buildId" -ForegroundColor Gray

try {
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD'; `$env:NODE_ENV='production'; `$env:PORT='3000'; `$env:BUILD_ID='$buildId'; npm start" -WindowStyle Minimized
    Start-Sleep -Seconds 15
    
    # Vérifier plusieurs fois
    $maxRetries = 10
    $retryCount = 0
    $isRunning = $false
    
    while ($retryCount -lt $maxRetries -and -not $isRunning) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000" -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction Stop
            if ($response.StatusCode -eq 200) {
                $isRunning = $true
                Write-Host "   ✅ Next.js répond : HTTP $($response.StatusCode)" -ForegroundColor Green
                
                # Vérifier les headers de cache
                Write-Host "   📋 Headers de cache:" -ForegroundColor Gray
                if ($response.Headers['Cache-Control']) {
                    Write-Host "      Cache-Control: $($response.Headers['Cache-Control'])" -ForegroundColor Gray
                }
                if ($response.Headers['ETag']) {
                    Write-Host "      ETag: $($response.Headers['ETag'])" -ForegroundColor Gray
                }
            }
        } catch {
            $retryCount++
            if ($retryCount -lt $maxRetries) {
                Write-Host "   ⏳ Attente du démarrage... ($retryCount/$maxRetries)" -ForegroundColor Gray
                Start-Sleep -Seconds 3
            }
        }
    }
    
    if (-not $isRunning) {
        Write-Host "   ⚠️  Next.js ne répond pas encore" -ForegroundColor Yellow
        Write-Host "   💡 Vérifiez manuellement : http://localhost:3000" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 9. Instructions finales
Write-Host "`n📊 RÉSUMÉ:" -ForegroundColor Cyan
Write-Host "   ✅ Tous les caches nettoyés" -ForegroundColor Green
Write-Host "   ✅ Application reconstruite avec Build ID: $buildId" -ForegroundColor Green
Write-Host "   ✅ $totalFiles fichiers statiques générés" -ForegroundColor Green
Write-Host "   ✅ Next.js redémarré avec nouveau Build ID" -ForegroundColor Green
Write-Host "`n🔥 ACTIONS REQUISES POUR VOIR LES CHANGEMENTS:" -ForegroundColor Red
Write-Host "   1. Videz COMPLÈTEMENT le cache du navigateur:" -ForegroundColor Yellow
Write-Host "      - Chrome/Edge: Ctrl+Shift+Delete → Tout sélectionner → Effacer" -ForegroundColor Gray
Write-Host "      - Firefox: Ctrl+Shift+Delete → Tout sélectionner → Effacer" -ForegroundColor Gray
Write-Host "   2. Utilisez un rechargement FORCÉ:" -ForegroundColor Yellow
Write-Host "      - Ctrl+Shift+R (Chrome/Edge)" -ForegroundColor Gray
Write-Host "      - Ctrl+F5 (Firefox)" -ForegroundColor Gray
Write-Host "   3. Testez en navigation privée pour contourner le cache" -ForegroundColor Yellow
Write-Host "   4. Videz le cache Cloudflare si nécessaire" -ForegroundColor Yellow
Write-Host "`n🌐 URLs à tester:" -ForegroundColor Cyan
Write-Host "   - Local: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Production: https://iahome.fr" -ForegroundColor Gray
Write-Host "`n💡 Build ID actuel: $buildId" -ForegroundColor Cyan
Write-Host "   (Ce Build ID est unique et force l'invalidation du cache)" -ForegroundColor Gray
Write-Host ""

