# Redéploiement production iahome : vider caches + redémarrer services + purge Cloudflare
# Usage: .\scripts\redeploy-prod-cache-clear.ps1
# À exécuter depuis la racine du projet (iahome)
# Durée estimée : 5 à 15 min (build Next.js + build Docker + purge Cloudflare)

$ErrorActionPreference = "Stop"
# Racine du projet = parent du dossier scripts
$ProjectRoot = Split-Path -Parent $PSScriptRoot
if (-not (Test-Path (Join-Path $ProjectRoot "docker-compose.prod.yml"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot

Write-Host "`n=== Redéploiement production (caches vides + Cloudflare) ===" -ForegroundColor Cyan
Write-Host "   Répertoire: $ProjectRoot`n" -ForegroundColor Gray

# 1. Arrêter les conteneurs
Write-Host "1. Arrêt des conteneurs..." -ForegroundColor Yellow
$errPref = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
try { & docker-compose -f docker-compose.prod.yml down 2>&1 | Out-Null } catch {}
$ErrorActionPreference = $errPref
if ($LASTEXITCODE -ne 0) { Write-Host "   (aucun conteneur ou déjà arrêté)" -ForegroundColor Gray }

# 2. Vider le cache Next.js (.next)
Write-Host "2. Suppression du cache Next.js (.next)..." -ForegroundColor Yellow
$nextPath = Join-Path $ProjectRoot ".next"
if (Test-Path $nextPath) {
    Remove-Item -Recurse -Force $nextPath
    Write-Host "   OK - .next supprimé" -ForegroundColor Green
} else {
    Write-Host "   (dossier .next absent)" -ForegroundColor Gray
}

# 3. Rebuild Next.js sur l'hôte (requis par le Dockerfile)
Write-Host "3. Build Next.js (npm run build)..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR: build Next.js échoué" -ForegroundColor Red
    exit 1
}
Write-Host "   OK - Build terminé" -ForegroundColor Green

# 4. Fichier env pour Docker : .env.production.local requis par docker-compose
$envProdLocal = Join-Path $ProjectRoot ".env.production.local"
$envProd = Join-Path $ProjectRoot ".env.production"
$envProdNoDot = Join-Path $ProjectRoot "env.production.local"
if (-not (Test-Path $envProdLocal)) {
    if (Test-Path $envProd) {
        Copy-Item $envProd $envProdLocal
        Write-Host "   .env.production copié vers .env.production.local (pour docker-compose)" -ForegroundColor Gray
    } else {
        Write-Host "   ATTENTION: .env.production.local et .env.production absents - demarrage peut echouer" -ForegroundColor DarkYellow
    }
}
if (Test-Path $envProdLocal) {
    if (-not (Test-Path $envProdNoDot)) {
        Copy-Item $envProdLocal $envProdNoDot
        Write-Host "   .env.production.local copie vers env.production.local (pour Dockerfile)" -ForegroundColor Gray
    }
}

# 5. Build image Docker (sans cache pour prendre le nouveau .next)
Write-Host "4. Build image Docker (--no-cache)..." -ForegroundColor Yellow
$errPref = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& docker-compose -f docker-compose.prod.yml build --no-cache iahome-app 2>&1 | Out-Null
$ErrorActionPreference = $errPref
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR: build Docker échoué" -ForegroundColor Red
    exit 1
}
Write-Host "   OK - Image construite" -ForegroundColor Green

# 6. Démarrer les services
Write-Host "5. Démarrage des services (docker-compose up -d)..." -ForegroundColor Yellow
$errPref = $ErrorActionPreference; $ErrorActionPreference = 'Continue'
& docker-compose -f docker-compose.prod.yml up -d --force-recreate 2>&1 | Out-Null
$ErrorActionPreference = $errPref
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ERREUR: démarrage échoué" -ForegroundColor Red
    exit 1
}
Write-Host "   OK - Conteneurs démarrés" -ForegroundColor Green

# 7. Attendre que l'app réponde
Write-Host "6. Attente du démarrage de l'app (30 s)..." -ForegroundColor Yellow
$baseUrl = "http://localhost:3000"
$maxAttempts = 15
$attempt = 0
do {
    Start-Sleep -Seconds 2
    try {
        $r = Invoke-WebRequest -Uri $baseUrl -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) { break }
    } catch {}
    $attempt++
} while ($attempt -lt $maxAttempts)
if ($attempt -ge $maxAttempts) {
    Write-Host "   L'app ne répond pas encore sur $baseUrl (continuer quand même)" -ForegroundColor DarkYellow
} else {
    Write-Host "   OK - App répond sur $baseUrl" -ForegroundColor Green
}

# 8. Purge cache Cloudflare (via l'API de l'app)
Write-Host "7. Purge du cache Cloudflare..." -ForegroundColor Yellow
try {
    $purgeUrl = "$baseUrl/api/purge-cloudflare-cache"
    $body = @{}
    $response = Invoke-RestMethod -Uri $purgeUrl -Method POST -ContentType "application/json" -Body "{}" -TimeoutSec 15 -ErrorAction Stop
    if ($response.success) {
        Write-Host "   OK - Cache Cloudflare purgé" -ForegroundColor Green
    } else {
        Write-Host "   Réponse: $($response.message)" -ForegroundColor DarkYellow
        if ($response.message -match "manquante|missing") {
            Write-Host "   Astuce: définir CLOUDFLARE_API_TOKEN et CLOUDFLARE_ZONE_ID dans .env.production.local" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "   Purge Cloudflare non effectuée: $($_.Exception.Message)" -ForegroundColor DarkYellow
    Write-Host "   Vous pouvez purger manuellement: https://dash.cloudflare.com > Caching > Purge Everything" -ForegroundColor Gray
}

Write-Host "`n=== Redéploiement terminé ===" -ForegroundColor Cyan
Write-Host "   App: $baseUrl" -ForegroundColor White
Write-Host "   En production (via Cloudflare/Traefik): https://iahome.fr`n" -ForegroundColor White
