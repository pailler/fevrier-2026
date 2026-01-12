# Script pour reconstruire et démarrer localhost:3000 en mode production (iahome.fr)

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RECONSTRUCTION MODE PRODUCTION" -ForegroundColor Cyan
Write-Host "  localhost:3000 (iahome.fr)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Changer vers le répertoire du projet
$RootPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $RootPath

Write-Host "Répertoire: $RootPath" -ForegroundColor Gray
Write-Host ""

# Vérifier Node.js
$node = Get-Command node -ErrorAction SilentlyContinue
if (-not $node) {
    Write-Host "ERREUR: Node.js non trouvé" -ForegroundColor Red
    Write-Host "Installez Node.js depuis: https://nodejs.org/" -ForegroundColor Yellow
    pause
    exit 1
}

Write-Host "Node.js: $($node.Version)" -ForegroundColor Green
Write-Host ""

# Arrêter les processus existants sur le port 3000
Write-Host "Arrêt des processus sur le port 3000..." -ForegroundColor Yellow
$port3000 = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($port3000) {
    $proc = Get-Process -Id $port3000.OwningProcess -ErrorAction SilentlyContinue
    if ($proc) {
        Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 2
        Write-Host "OK: Processus arrêté" -ForegroundColor Green
    }
} else {
    Write-Host "OK: Port 3000 libre" -ForegroundColor Green
}
Write-Host ""

# Arrêter tous les processus Node.js pour éviter les conflits
Write-Host "Arrêt de tous les processus Node.js..." -ForegroundColor Yellow
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | ForEach-Object {
        Stop-Process -Id $_.Id -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
    Write-Host "OK: Processus Node.js arrêtés" -ForegroundColor Green
} else {
    Write-Host "OK: Aucun processus Node.js en cours" -ForegroundColor Green
}
Write-Host ""

# Nettoyer l'ancien build
Write-Host "Nettoyage de l'ancien build..." -ForegroundColor Yellow
$buildPath = Join-Path $RootPath ".next"
if (Test-Path $buildPath) {
    Remove-Item -Path $buildPath -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "OK: Ancien build supprimé" -ForegroundColor Green
} else {
    Write-Host "OK: Aucun build à nettoyer" -ForegroundColor Green
}
Write-Host ""

# Vérifier que le fichier d'environnement de production existe
$envFile = Join-Path $RootPath "env.production.local"
if (Test-Path $envFile) {
    Write-Host "Fichier d'environnement trouvé: env.production.local" -ForegroundColor Green
    # Charger les variables d'environnement depuis le fichier
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($key, $value, "Process")
        }
    }
    Write-Host "Variables d'environnement chargées" -ForegroundColor Green
} else {
    Write-Host "ATTENTION: env.production.local non trouvé" -ForegroundColor Yellow
    Write-Host "Les variables d'environnement par défaut seront utilisées" -ForegroundColor Gray
}
Write-Host ""

# Reconstruire l'application
Write-Host "Construction de l'application Next.js en mode production..." -ForegroundColor Yellow
Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Gray
Write-Host ""

$env:NODE_ENV = "production"
$env:PORT = "3000"

# Charger les variables d'environnement avant le build
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value
        }
    }
}

npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "ERREUR: Échec de la construction" -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "OK: Build terminé avec succès" -ForegroundColor Green
Write-Host ""

# Vérifier que le build existe
$buildPath = Join-Path $RootPath ".next"
if (-not (Test-Path $buildPath)) {
    Write-Host "ERREUR: Le build n'a pas été créé" -ForegroundColor Red
    pause
    exit 1
}

# Démarrer Next.js en mode production
Write-Host "Démarrage de Next.js en mode production..." -ForegroundColor Yellow
Write-Host "Mode: production" -ForegroundColor Gray
Write-Host "Port: 3000" -ForegroundColor Gray
Write-Host "URL: http://localhost:3000" -ForegroundColor Gray
Write-Host "Production: https://iahome.fr" -ForegroundColor Gray
Write-Host ""

# S'assurer que les variables d'environnement sont définies
$env:NODE_ENV = "production"
$env:PORT = "3000"

# Recharger les variables d'environnement pour le démarrage
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            Set-Item -Path "env:$key" -Value $value
        }
    }
}

# Démarrer Next.js
npm start



