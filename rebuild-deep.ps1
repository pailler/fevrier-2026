# Script pour une reconstruction complète en profondeur

Write-Host "🔧 RECONSTRUCTION COMPLÈTE EN PROFONDEUR" -ForegroundColor Cyan
Write-Host "======================================`n" -ForegroundColor Cyan

$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $scriptDir

# 1. Arrêter tous les processus Node.js
Write-Host "1️⃣ Arrêt de tous les processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   ⏹️  Arrêt de $($nodeProcesses.Count) processus Node.js..." -ForegroundColor Gray
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction Stop
            Write-Host "      ✅ Processus $($_.Id) arrêté" -ForegroundColor Gray
        } catch {
            Write-Host "      ⚠️  Erreur lors de l'arrêt du processus $($_.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 5
    Write-Host "   ✅ Tous les processus Node.js arrêtés" -ForegroundColor Green
} else {
    Write-Host "   ✅ Aucun processus Node.js à arrêter" -ForegroundColor Green
}

# 2. Nettoyer complètement tous les caches
Write-Host "`n2️⃣ Nettoyage complet des caches..." -ForegroundColor Yellow
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
        Write-Host "   🗑️  Suppression de $dir..." -ForegroundColor Gray
        try {
            Remove-Item -Path $dir -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ $dir supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erreur lors de la suppression de $dir : $($_.Exception.Message)" -ForegroundColor Yellow
            # Essayer avec robocopy pour les fichiers verrouillés
            try {
                $emptyDir = Join-Path $env:TEMP "empty_$(Get-Random)"
                New-Item -ItemType Directory -Path $emptyDir -Force | Out-Null
                robocopy $emptyDir $dir /MIR /R:1 /W:1 /NFL /NDL /NJH /NJS | Out-Null
                Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
                Remove-Item -Path $emptyDir -Recurse -Force -ErrorAction SilentlyContinue
                Write-Host "   ✅ $dir supprimé (méthode alternative)" -ForegroundColor Green
            } catch {
                Write-Host "   ⚠️  Impossible de supprimer $dir complètement" -ForegroundColor Yellow
            }
        }
    }
}

# 3. Nettoyer le cache npm
Write-Host "`n3️⃣ Nettoyage du cache npm..." -ForegroundColor Yellow
try {
    $npmCacheOutput = npm cache clean --force 2>&1
    Write-Host "   ✅ Cache npm nettoyé" -ForegroundColor Green
} catch {
    Write-Host "   ⚠️  Erreur lors du nettoyage du cache npm: $($_.Exception.Message)" -ForegroundColor Yellow
}

# 4. Vérifier et réinstaller les dépendances si nécessaire
Write-Host "`n4️⃣ Vérification des dépendances..." -ForegroundColor Yellow
if (-not (Test-Path "node_modules")) {
    Write-Host "   ⚠️  node_modules n'existe pas. Installation des dépendances..." -ForegroundColor Yellow
    try {
        $installOutput = npm install 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "   ✅ Dépendances installées" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  Avertissements lors de l'installation" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ Erreur lors de l'installation: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   ✅ node_modules existe" -ForegroundColor Green
    $reinstall = Read-Host "   Voulez-vous réinstaller les dépendances ? (O/N)"
    if ($reinstall -eq "O" -or $reinstall -eq "o") {
        Write-Host "   🗑️  Suppression de node_modules..." -ForegroundColor Gray
        try {
            Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction Stop
            Write-Host "   ✅ node_modules supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Erreur lors de la suppression de node_modules" -ForegroundColor Yellow
        }
        
        Write-Host "   📦 Installation des dépendances..." -ForegroundColor Gray
        try {
            $installOutput = npm install 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "   ✅ Dépendances installées" -ForegroundColor Green
            } else {
                Write-Host "   ⚠️  Avertissements lors de l'installation" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "   ❌ Erreur lors de l'installation: $($_.Exception.Message)" -ForegroundColor Red
            exit 1
        }
    }
}

# 5. Nettoyer les fichiers de lock si nécessaire
Write-Host "`n5️⃣ Vérification des fichiers de lock..." -ForegroundColor Yellow
if (Test-Path "package-lock.json") {
    Write-Host "   ✅ package-lock.json trouvé" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  package-lock.json introuvable" -ForegroundColor Yellow
}

# 6. Reconstruire avec un nouveau Build ID
Write-Host "`n6️⃣ Reconstruction complète de l'application..." -ForegroundColor Yellow
$buildId = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')"
Write-Host "   📋 Build ID: $buildId" -ForegroundColor Gray
Write-Host "   🚀 Lancement du build (cela peut prendre plusieurs minutes)..." -ForegroundColor Gray

$env:BUILD_ID = $buildId
$env:NODE_ENV = "production"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Désactiver le cache TypeScript
$env:TS_NODE_TRANSPILE_ONLY = "1"

try {
    # Afficher la progression
    $buildProcess = Start-Process -FilePath "npm" -ArgumentList "run", "build" -NoNewWindow -PassThru -RedirectStandardOutput "build-output.log" -RedirectStandardError "build-error.log"
    
    Write-Host "   ⏳ Build en cours..." -ForegroundColor Gray
    
    # Attendre la fin du build avec un timeout
    $timeout = 600 # 10 minutes
    $elapsed = 0
    while (-not $buildProcess.HasExited -and $elapsed -lt $timeout) {
        Start-Sleep -Seconds 5
        $elapsed += 5
        if ($elapsed % 30 -eq 0) {
            Write-Host "   ⏳ Build en cours... ($elapsed secondes)" -ForegroundColor Gray
        }
    }
    
    if (-not $buildProcess.HasExited) {
        Write-Host "   ⚠️  Timeout du build. Arrêt du processus..." -ForegroundColor Yellow
        Stop-Process -Id $buildProcess.Id -Force -ErrorAction SilentlyContinue
        exit 1
    }
    
    if ($buildProcess.ExitCode -eq 0) {
        Write-Host "   ✅ Build réussi!" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur lors du build (code: $($buildProcess.ExitCode))" -ForegroundColor Red
        if (Test-Path "build-error.log") {
            Write-Host "   📋 Dernières erreurs:" -ForegroundColor Cyan
            Get-Content "build-error.log" -Tail 20 | ForEach-Object { Write-Host "      $_" -ForegroundColor Gray }
        }
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur lors du build: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 7. Vérifier les fichiers statiques
Write-Host "`n7️⃣ Vérification des fichiers statiques..." -ForegroundColor Yellow
$staticDirs = @(".next/static", ".next/static/chunks", ".next/static/css")
$allPresent = $true
$totalFiles = 0
foreach ($dir in $staticDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem -Path $dir -Recurse -File -ErrorAction SilentlyContinue
        $fileCount = $files.Count
        $totalFiles += $fileCount
        $size = ($files | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "   ✅ $dir : $fileCount fichiers ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
    } else {
        Write-Host "   ❌ $dir : MANQUANT!" -ForegroundColor Red
        $allPresent = $false
    }
}

if ($allPresent) {
    Write-Host "   ✅ Total: $totalFiles fichiers statiques générés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Certains fichiers statiques sont manquants" -ForegroundColor Yellow
}

# 8. Nettoyer les fichiers de log temporaires
Write-Host "`n8️⃣ Nettoyage des fichiers temporaires..." -ForegroundColor Yellow
$tempFiles = @("build-output.log", "build-error.log")
foreach ($file in $tempFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
    }
}
Write-Host "   ✅ Fichiers temporaires nettoyés" -ForegroundColor Green

# 9. Résumé
Write-Host "`n📊 RÉSUMÉ DE LA RECONSTRUCTION:" -ForegroundColor Cyan
Write-Host "   ✅ Tous les caches nettoyés" -ForegroundColor Green
Write-Host "   ✅ Application reconstruite complètement (Build ID: $buildId)" -ForegroundColor Green
Write-Host "   ✅ $totalFiles fichiers statiques générés" -ForegroundColor Green
Write-Host "`n💡 Pour démarrer en production, exécutez :" -ForegroundColor Yellow
Write-Host "   .\start-production.ps1" -ForegroundColor Gray
Write-Host "`n💡 Pour redémarrer Next.js maintenant :" -ForegroundColor Yellow
Write-Host "   `$env:NODE_ENV='production'; npm start" -ForegroundColor Gray
Write-Host ""

