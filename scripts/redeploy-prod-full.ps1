<#
.SYNOPSIS
    Redéploiement production complet et robuste - Tue tous les processus, nettoie les caches, rebuild et redémarre.
.DESCRIPTION
    Script robuste qui:
    1. Tue les processus Node.js locaux
    2. Libère les ports 3000, 80, 443
    3. Arrête et supprime les conteneurs Docker
    4. Nettoie tous les caches (.next, node_modules/.cache)
    5. Rebuild Next.js
    6. Rebuild l'image Docker sans cache
    7. Redémarre tous les services
    8. Purge le cache Cloudflare
.PARAMETER SkipCloudflare
    Ne pas tenter la purge Cloudflare (utile si pas configuré)
.PARAMETER SkipBuild
    Ne pas rebuild Next.js (utiliser .next existant - déconseillé)
.EXAMPLE
    .\scripts\redeploy-prod-full.ps1
.EXAMPLE
    .\scripts\redeploy-prod-full.ps1 -SkipCloudflare
#>

param(
    [switch]$SkipCloudflare,
    [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

# Racine du projet (parent du dossier scripts)
$ProjectRoot = if ($PSScriptRoot) {
    $resolved = Resolve-Path -Path $PSScriptRoot -ErrorAction SilentlyContinue
    if ($resolved) { Split-Path -Parent $resolved } else { Split-Path -Parent $PSScriptRoot }
} else {
    Get-Location
}
if (-not (Test-Path (Join-Path $ProjectRoot "docker-compose.prod.yml"))) {
    $ProjectRoot = Get-Location
}
Set-Location $ProjectRoot

# Docker doit etre demarre (Docker Desktop)
# Utiliser cmd pour eviter que stderr de docker ne declenche une erreur PowerShell
function Test-DockerReady {
    cmd /c "docker info >nul 2>&1"
    return ($LASTEXITCODE -eq 0)
}
$dockerOk = Test-DockerReady
if (-not $dockerOk) {
    Write-Host "[X] Docker n'est pas demarre." -ForegroundColor Red
    Write-Host "    Lancez Docker Desktop puis relancez ce script." -ForegroundColor Yellow
    $dockerExe = "C:\Program Files\Docker\Docker\Docker Desktop.exe"
    if (Test-Path $dockerExe) {
        Write-Host "    Demarrage automatique de Docker Desktop..." -ForegroundColor Gray
        Start-Process $dockerExe
        Write-Host "    Attente du demarrage (60 s max)..." -ForegroundColor Gray
        for ($i = 1; $i -le 30; $i++) {
            Start-Sleep -Seconds 2
            if (Test-DockerReady) { $dockerOk = $true; break }
            Write-Host "    ... $i" -ForegroundColor DarkGray
        }
    }
    if (-not $dockerOk) {
        Write-Host "[X] Demarrez Docker Desktop manuellement puis relancez." -ForegroundColor Red
        exit 1
    }
    Write-Host "    [OK] Docker pret" -ForegroundColor Green
}
$baseUrl = "http://localhost:3000"

function Write-Step { param($n, $msg) Write-Host "`n[$n] $msg" -ForegroundColor Cyan }
function Write-Ok { param($msg) Write-Host "   [OK] $msg" -ForegroundColor Green }
function Write-Warn { param($msg) Write-Host "   [!] $msg" -ForegroundColor Yellow }
function Write-Err { param($msg) Write-Host "   [X] $msg" -ForegroundColor Red }

Write-Host "`n" -NoNewline
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host "  REDEPLOIEMENT PRODUCTION COMPLET - iahome" -ForegroundColor Magenta
Write-Host "===============================================================" -ForegroundColor Magenta
Write-Host "  Répertoire: $ProjectRoot" -ForegroundColor Gray
Write-Host "  Heure: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""

# ─── 1. Tuer les processus Node.js ─────────────────────────────────────────
Write-Step 1 "Arrêt des processus Node.js..."

$nodeProcs = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcs) {
    $count = ($nodeProcs | Measure-Object).Count
    foreach ($proc in $nodeProcs) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
        } catch {
            Write-Warn "Impossible d'arrêter PID $($proc.Id) : $_"
        }
    }
    Write-Ok "Processus Node.js traités ($count trouvés)"
} else {
    Write-Host "   (aucun processus Node.js en cours)" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# ─── 2. Arrêter les conteneurs Docker EN PREMIER ───────────────────────────
# (libère le port 3000 sans tenter de tuer le processus Docker protégé)
Write-Step 2 "Arrêt et suppression des conteneurs Docker..."

$errPref = $ErrorActionPreference
$ErrorActionPreference = 'Continue'

try {
    docker compose -f docker-compose.prod.yml down --remove-orphans *> $null
    if ($LASTEXITCODE -eq 0) {
        Write-Ok "Conteneurs arrêtés et supprimés"
    } else {
        Write-Warn "docker-compose down a échoué ou ignoré"
    }
} catch {
    Write-Warn "Erreur docker down: $_"
}

$ErrorActionPreference = $errPref
Start-Sleep -Seconds 2

# ─── 3. Libérer le port 3000 (processus locaux uniquement, exclut Docker) ───
Write-Step 3 "Libération du port 3000..."

$netstat = netstat -ano | Select-String ":3000\s+.*LISTENING"
if ($netstat) {
    $pidsToKill = @()
    foreach ($line in $netstat) {
        if ($line -match '\s+(\d+)\s*$') {
            $procId = $Matches[1]
            if ($procId -ne "0") { $pidsToKill += $procId }
        }
    }
    $pidsToKill = $pidsToKill | Select-Object -Unique
    foreach ($procId in $pidsToKill) {
        # Ne jamais tuer les processus Docker (protégés, accès refusé)
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        $procName = if ($proc) { $proc.ProcessName } else { "" }
        if ($procName -match "docker|com\.docker|vpnkit|wsl") {
            Write-Host "   (PID $procId = $procName, ignoré - processus Docker)" -ForegroundColor Gray
            continue
        }
        try {
            Stop-Process -Id $procId -Force -ErrorAction Stop
            Write-Ok "Processus $procId (port 3000) arrete"
        } catch {
            Write-Warn "Impossible d'arreter PID $procId ($procName) : $_"
        }
    }
} else {
    Write-Host "   (port 3000 libre)" -ForegroundColor Gray
}

Start-Sleep -Seconds 2

# ─── 4. Nettoyage des caches ──────────────────────────────────────────────
Write-Step 4 "Nettoyage des caches..."

$cleaned = @()

# .next
$nextPath = Join-Path $ProjectRoot ".next"
if (Test-Path $nextPath) {
    Remove-Item -Recurse -Force $nextPath
    $cleaned += ".next"
}

# node_modules/.cache
$npmCache = Join-Path $ProjectRoot "node_modules\.cache"
if (Test-Path $npmCache) {
    Remove-Item -Recurse -Force $npmCache
    $cleaned += "node_modules/.cache"
}

# .turbo (si utilisé)
$turboPath = Join-Path $ProjectRoot ".turbo"
if (Test-Path $turboPath) {
    Remove-Item -Recurse -Force $turboPath
    $cleaned += ".turbo"
}

if ($cleaned.Count -gt 0) {
    Write-Ok "Caches supprimés: $($cleaned -join ', ')"
} else {
    Write-Host "   (aucun cache à supprimer)" -ForegroundColor Gray
}

# ─── 5. Build Next.js ─────────────────────────────────────────────────────
if (-not $SkipBuild) {
    Write-Step 5 "Build Next.js (npm run build)..."

    $errSave = $ErrorActionPreference
    $ErrorActionPreference = 'Continue'
    $buildOutput = npm run build 2>&1
    $buildExit = $LASTEXITCODE
    $ErrorActionPreference = $errSave

    if ($buildExit -ne 0) {
        Write-Err "Build Next.js echoue (exit $buildExit)"
        Write-Host $buildOutput -ForegroundColor Red
        exit 1
    }
    Write-Ok "Build Next.js termine"
} else {
    Write-Step 5 "Build Next.js (ignoré - SkipBuild)"
    if (-not (Test-Path (Join-Path $ProjectRoot ".next"))) {
        Write-Err "Dossier .next absent - exécutez sans -SkipBuild"
        exit 1
    }
}

# ─── 6. Fichiers env pour Docker ──────────────────────────────────────────
Write-Step 6 "Vérification des fichiers .env..."

$envProdLocal = Join-Path $ProjectRoot ".env.production.local"
$envProd = Join-Path $ProjectRoot ".env.production"
$envProdNoDot = Join-Path $ProjectRoot "env.production.local"

if (-not (Test-Path $envProdLocal)) {
    if (Test-Path $envProd) {
        Copy-Item $envProd $envProdLocal
        Write-Ok ".env.production copié vers .env.production.local"
    } else {
        Write-Warn ".env.production.local et .env.production absents"
    }
}
# Dockerfile requiert env.production.local (sans point initial) dans le contexte de build
if (Test-Path $envProdLocal) {
    Copy-Item $envProdLocal $envProdNoDot -Force
    Write-Ok "env.production.local créé (pour Dockerfile)"
} elseif (-not (Test-Path $envProdNoDot)) {
    Write-Err "Aucun fichier .env.production(.local) trouvé - créez .env.production.local"
    exit 1
}

# ─── 7. Build image Docker ────────────────────────────────────────────────
Write-Step 7 "Build image Docker (--no-cache)..."

$ErrorActionPreference = 'Continue'
$buildDocker = docker compose -f docker-compose.prod.yml build --no-cache --pull iahome-app apprendre-autrement 2>&1
$ErrorActionPreference = 'Stop'

if ($LASTEXITCODE -ne 0) {
    Write-Err "Build Docker échoué"
    Write-Host $buildDocker -ForegroundColor Red
    exit 1
}
Write-Ok "Image Docker construite"

# ─── 8. Démarrage des services ────────────────────────────────────────────
Write-Step 8 "Démarrage des services (--force-recreate)..."

$ErrorActionPreference = 'Continue'
$upResult = docker compose -f docker-compose.prod.yml up -d --force-recreate 2>&1
$ErrorActionPreference = 'Stop'

if ($LASTEXITCODE -ne 0) {
    Write-Err "Démarrage échoué"
    Write-Host $upResult -ForegroundColor Red
    exit 1
}
Write-Ok "Conteneurs démarrés"

# ─── 9. Attente du démarrage ──────────────────────────────────────────────
Write-Step 9 "Attente du démarrage de l'app (jusqu'à 60 s)..."

$maxAttempts = 30
$attempt = 0
$ready = $false

while ($attempt -lt $maxAttempts) {
    Start-Sleep -Seconds 2
    try {
        $r = Invoke-WebRequest -Uri $baseUrl -Method Head -TimeoutSec 5 -UseBasicParsing -ErrorAction SilentlyContinue
        if ($r.StatusCode -eq 200) {
            $ready = $true
            break
        }
    } catch {}
    $attempt++
    Write-Host "   Tentative $attempt/$maxAttempts..." -ForegroundColor Gray
}

if (-not $ready) {
    Write-Warn "L'app ne répond pas encore sur $baseUrl"
    Write-Host "   Vérifiez: docker logs iahome-app" -ForegroundColor Gray
} else {
    Write-Ok "App opérationnelle sur $baseUrl"
}

# ─── 10. Purge Cloudflare ─────────────────────────────────────────────────
if (-not $SkipCloudflare) {
    Write-Step 10 "Purge du cache Cloudflare..."

    try {
        $purgeUrl = "$baseUrl/api/purge-cloudflare-cache"
        $response = Invoke-RestMethod -Uri $purgeUrl -Method POST -ContentType "application/json" -Body "{}" -TimeoutSec 15 -ErrorAction Stop
        if ($response.success) {
            Write-Ok "Cache Cloudflare purgé"
        } else {
            Write-Warn $response.message
        }
    } catch {
        Write-Warn "Purge Cloudflare non effectuée: $($_.Exception.Message)"
        Write-Host "   Purge manuelle: https://dash.cloudflare.com > Caching > Purge Everything" -ForegroundColor Gray
    }
} else {
    Write-Step 10 "Purge Cloudflare (ignorée - SkipCloudflare)"
}

# ─── Résumé final ──────────────────────────────────────────────────────────
Write-Host "`n"
Write-Host "===============================================================" -ForegroundColor Green
Write-Host "  REDEPLOIEMENT TERMINE" -ForegroundColor Green
Write-Host "===============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "  App locale:  $baseUrl" -ForegroundColor White
Write-Host "  Production:  https://iahome.fr" -ForegroundColor White
Write-Host ""
Write-Host "  Si les changements n'apparaissent pas:" -ForegroundColor Yellow
Write-Host "  • Ctrl+Shift+R (rafraîchissement forcé) dans le navigateur" -ForegroundColor Gray
Write-Host "  • Ou vider le cache du navigateur" -ForegroundColor Gray
Write-Host "  • Ou tester en navigation privée" -ForegroundColor Gray
Write-Host ""
Write-Host "  Logs: docker logs -f iahome-app" -ForegroundColor Gray
Write-Host "        docker logs -f apprendre-autrement" -ForegroundColor Gray
Write-Host ""
