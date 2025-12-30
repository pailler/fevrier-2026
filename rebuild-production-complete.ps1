# Script pour reconstruire COMPLÈTEMENT en mode production (iahome.fr)
# Nettoie tous les caches et reconstruit depuis zéro

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RECONSTRUCTION COMPLETE PRODUCTION" -ForegroundColor Cyan
Write-Host "  localhost:3000 (iahome.fr)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Changer vers le répertoire du projet
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

Write-Host "Répertoire: $RootPath" -ForegroundColor Gray
Write-Host ""

# 1. Arrêter TOUS les processus Node.js
Write-Host "[1/6] Arrêt de tous les processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "   Arrêt de $($nodeProcesses.Count) processus..." -ForegroundColor Gray
    $nodeProcesses | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
        } catch {
            # Ignorer les erreurs
        }
    }
    Start-Sleep -Seconds 3
    Write-Host "   OK: Processus arrêtés" -ForegroundColor Green
} else {
    Write-Host "   OK: Aucun processus Node.js en cours" -ForegroundColor Green
}
Write-Host ""

# 2. Nettoyer TOUS les caches
Write-Host "[2/6] Nettoyage AGRESSIF de tous les caches..." -ForegroundColor Yellow
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
    $fullPath = Join-Path $RootPath $dir
    if (Test-Path $fullPath) {
        Write-Host "   Suppression de $dir..." -ForegroundColor Gray
        try {
            Remove-Item -Path $fullPath -Recurse -Force -ErrorAction SilentlyContinue
            Start-Sleep -Milliseconds 500
            Write-Host "   OK: $dir supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ATTENTION: Impossible de supprimer $dir complètement" -ForegroundColor Yellow
        }
    }
}
Write-Host ""

# 3. Nettoyer le cache npm
Write-Host "[3/6] Nettoyage du cache npm..." -ForegroundColor Yellow
try {
    npm cache clean --force 2>&1 | Out-Null
    Write-Host "   OK: Cache npm nettoyé" -ForegroundColor Green
} catch {
    Write-Host "   ATTENTION: Erreur lors du nettoyage du cache npm" -ForegroundColor Yellow
}
Write-Host ""

# 4. Vérifier Node.js
Write-Host "[4/6] Vérification de l'environnement..." -ForegroundColor Yellow
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERREUR: Node.js non trouvé" -ForegroundColor Red
    Write-Host "Installez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host "   OK: Node.js $($node.Version)" -ForegroundColor Green
Write-Host ""

# 5. Charger les variables d'environnement
Write-Host "[5/6] Chargement des variables d'environnement..." -ForegroundColor Yellow
$envFile = Join-Path $RootPath "env.production.local"
if (Test-Path $envFile) {
    Write-Host "   Fichier trouvé: env.production.local" -ForegroundColor Green
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value
        }
    }
    Write-Host "   OK: Variables d'environnement chargées" -ForegroundColor Green
} else {
    Write-Host "   ATTENTION: env.production.local non trouvé" -ForegroundColor Yellow
}
Write-Host ""

# 6. Reconstruire l'application
Write-Host "[6/6] Reconstruction COMPLÈTE de l'application..." -ForegroundColor Yellow
Write-Host "   Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT = "3000"
$env:NEXT_TELEMETRY_DISABLED = "1"

# Générer un Build ID unique
$buildId = "build-$(Get-Date -Format 'yyyyMMdd-HHmmss')-$(Get-Random -Minimum 1000 -Maximum 9999)"
$env:BUILD_ID = $buildId
Write-Host "   Build ID: $buildId" -ForegroundColor Cyan
Write-Host ""

# Reconstruire
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "ERREUR: Échec de la construction" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  BUILD TERMINÉ AVEC SUCCÈS" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Build ID: $buildId" -ForegroundColor Cyan
Write-Host ""
Write-Host "Pour démarrer l'application:" -ForegroundColor Yellow
Write-Host "   npm start" -ForegroundColor White
Write-Host ""
Write-Host "Ou utilisez:" -ForegroundColor Yellow
Write-Host "   .\start-localhost-3000-simple.ps1" -ForegroundColor White
Write-Host ""
Write-Host "URLs:" -ForegroundColor Cyan
Write-Host "   Local: http://localhost:3000" -ForegroundColor White
Write-Host "   Production: https://iahome.fr" -ForegroundColor White
Write-Host ""



