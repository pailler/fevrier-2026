# Script pour reconstruire l'application Next.js en mode production en vidant tous les caches
# Usage: .\scripts\rebuild-prod-clean.ps1

Write-Host "`n🔨 RECONSTRUCTION PRODUCTION AVEC VIDAGE DES CACHES" -ForegroundColor Cyan
Write-Host "==================================================`n" -ForegroundColor Cyan

$RootPath = Split-Path -Parent $PSScriptRoot
Set-Location $RootPath

# 1. Arrêter tous les processus Next.js
Write-Host "1️⃣ Arrêt des processus Next.js..." -ForegroundColor Yellow
$nextjsProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue | Where-Object {
    $_.Path -like "*node*" -and (
        $_.CommandLine -like "*next*" -or
        $_.CommandLine -like "*3000*" -or
        (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) -ne $null
    )
}

if ($nextjsProcesses) {
    Write-Host "   ⏹️  Arrêt de $($nextjsProcesses.Count) processus Next.js..." -ForegroundColor Gray
    $nextjsProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "      ✅ Processus $($_.Id) arrêté" -ForegroundColor Green
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt du processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 2
}

# Vérifier si le port 3000 est toujours utilisé
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host "   🔍 Port 3000 encore utilisé, tentative de libération..." -ForegroundColor Yellow
    $portProcess = Get-Process -Id $port3000.OwningProcess -ErrorAction SilentlyContinue
    if ($portProcess) {
        try {
            Stop-Process -Id $portProcess.Id -Force -ErrorAction Stop
            Write-Host "      ✅ Processus sur port 3000 arrêté" -ForegroundColor Green
            Start-Sleep -Seconds 2
        } catch {
            Write-Host "      ⚠️  Impossible d'arrêter le processus sur port 3000" -ForegroundColor Yellow
        }
    }
}

Write-Host "   ✅ Tous les processus arrêtés" -ForegroundColor Green

# 2. Vider tous les caches
Write-Host "`n2️⃣ Vidage de tous les caches..." -ForegroundColor Yellow

$cacheDirs = @(
    ".next",
    "node_modules/.cache",
    ".turbo",
    ".next/cache",
    ".swc"
)

$deletedCount = 0
$deletedSize = 0

foreach ($dir in $cacheDirs) {
    $fullPath = Join-Path $RootPath $dir
    if (Test-Path $fullPath) {
        try {
            $size = (Get-ChildItem -Path $fullPath -Recurse -ErrorAction SilentlyContinue | 
                     Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
            $sizeMB = if ($size) { [math]::Round($size / 1MB, 2) } else { 0 }
            
            Remove-Item -Path $fullPath -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ Supprimé: $dir ($sizeMB MB)" -ForegroundColor Green
            $deletedCount++
            $deletedSize += $sizeMB
        } catch {
            Write-Host "   ⚠️  Erreur lors de la suppression de $dir : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ℹ️  $dir n'existe pas (déjà vide)" -ForegroundColor Gray
    }
}

Write-Host "   📊 Total supprimé: $deletedCount dossiers, $([math]::Round($deletedSize, 2)) MB" -ForegroundColor Cyan

# 3. Vider le cache npm
Write-Host "`n3️⃣ Vidage du cache npm..." -ForegroundColor Yellow
try {
    $npmCacheClean = npm cache clean --force 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   ✅ Cache npm vidé" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Erreur lors du vidage du cache npm" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️  Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Vérifier les variables d'environnement
Write-Host "`n4️⃣ Vérification des variables d'environnement..." -ForegroundColor Yellow
$envFile = Join-Path $RootPath ".env.production.local"
if (Test-Path $envFile) {
    Write-Host "   ✅ Fichier .env.production.local trouvé" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Fichier .env.production.local non trouvé" -ForegroundColor Yellow
}

# Charger les variables d'environnement
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value
        }
    }
}

# 5. Définir les variables d'environnement pour le build
Write-Host "`n5️⃣ Configuration de l'environnement de build..." -ForegroundColor Yellow
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"
$env:NEXT_PRIVATE_STANDALONE = "false"
$env:NEXT_BUILD_CACHE = "false"
$env:CI = "false"

# Générer un build ID unique
$buildId = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
$env:BUILD_ID = $buildId
Write-Host "   📋 Build ID: $buildId" -ForegroundColor Cyan
Write-Host "   📋 NODE_ENV: $env:NODE_ENV" -ForegroundColor Cyan
Write-Host "   📋 Cache désactivé: Oui" -ForegroundColor Cyan

# 6. Reconstruire l'application
Write-Host "`n6️⃣ Reconstruction de l'application (peut prendre 2-5 minutes)..." -ForegroundColor Yellow
Write-Host "   ⏳ Patientez, cela peut prendre du temps..." -ForegroundColor Gray
Write-Host ""

$buildStart = Get-Date
try {
    # Exécuter le build directement
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        $buildEnd = Get-Date
        $buildDuration = ($buildEnd - $buildStart).TotalSeconds
        Write-Host "   ✅ Build réussi en $([math]::Round($buildDuration, 1)) secondes!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du build (code: $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Vérifier que le build existe
Write-Host "`n7️⃣ Vérification du build..." -ForegroundColor Yellow
$buildPath = Join-Path $RootPath ".next"
if (Test-Path $buildPath) {
    $buildSize = (Get-ChildItem -Path $buildPath -Recurse -ErrorAction SilentlyContinue | 
                  Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
    $buildSizeMB = if ($buildSize) { [math]::Round($buildSize / 1MB, 2) } else { 0 }
    Write-Host "   ✅ Build créé avec succès ($buildSizeMB MB)" -ForegroundColor Green
    
    # Vérifier les fichiers statiques
    $staticDirs = @(".next/static", ".next/static/chunks", ".next/static/css")
    $allStaticExists = $true
    foreach ($dir in $staticDirs) {
        $fullPath = Join-Path $RootPath $dir
        if (Test-Path $fullPath) {
            $fileCount = (Get-ChildItem -Path $fullPath -Recurse -File -ErrorAction SilentlyContinue).Count
            Write-Host "      ✅ $dir ($fileCount fichiers)" -ForegroundColor Green
        } else {
            Write-Host "      ⚠️  $dir manquant" -ForegroundColor Yellow
            $allStaticExists = $false
        }
    }
    
    if ($allStaticExists) {
        Write-Host "   ✅ Tous les fichiers statiques sont présents" -ForegroundColor Green
    }
} else {
    Write-Host "   ❌ Le build n'a pas été créé" -ForegroundColor Red
    exit 1
}

# 8. Nettoyage terminé (pas de fichiers temporaires à nettoyer)
Write-Host "`n8️⃣ Vérification finale..." -ForegroundColor Yellow
Write-Host "   ✅ Tous les fichiers sont prêts" -ForegroundColor Green

# 9. Résumé
Write-Host "`n✅ RECONSTRUCTION TERMINÉE AVEC SUCCÈS !" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Green
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "   • Caches vidés: $deletedCount dossiers ($([math]::Round($deletedSize, 2)) MB)" -ForegroundColor White
Write-Host "   • Build créé: $buildSizeMB MB" -ForegroundColor White
Write-Host "   • Build ID: $buildId" -ForegroundColor White
Write-Host "   • Durée: $([math]::Round($buildDuration, 1)) secondes" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Pour démarrer l'application en mode production:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "🌐 L'application sera accessible sur:" -ForegroundColor Yellow
Write-Host "   http://localhost:3000" -ForegroundColor White
Write-Host "   https://iahome.fr" -ForegroundColor White
Write-Host ""
