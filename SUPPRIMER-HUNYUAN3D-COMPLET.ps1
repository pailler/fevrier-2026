# Script pour supprimer complètement Hunyuan3D et TOUS ses caches, modèles, volumes Docker, etc.

$ErrorActionPreference = "Continue"

Write-Host "`n========================================" -ForegroundColor Red
Write-Host "  SUPPRESSION COMPLÈTE DE HUNYUAN3D" -ForegroundColor Red
Write-Host "========================================" -ForegroundColor Red
Write-Host ""
Write-Host "Ce script va supprimer:" -ForegroundColor Yellow
Write-Host "  1. Conteneurs Docker (hunyuan3d)" -ForegroundColor White
Write-Host "  2. Volumes Docker (hunyuan3d-output, etc.)" -ForegroundColor White
Write-Host "  3. Images Docker liées à Hunyuan3D" -ForegroundColor White
Write-Host "  4. Le dossier projet hunyuan2-spz/" -ForegroundColor White
Write-Host "  5. Les modèles Hugging Face (cache centralisé)" -ForegroundColor White
Write-Host "  6. Les modèles Hugging Face (cache utilisateur)" -ForegroundColor White
Write-Host "  7. Les fichiers de configuration Traefik" -ForegroundColor White
Write-Host "  8. Les fichiers temporaires et caches" -ForegroundColor White
Write-Host ""
Write-Host "⚠️  ATTENTION: Cette action est irréversible!" -ForegroundColor Red
Write-Host "`nVoulez-vous continuer ? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -ne "O" -and $response -ne "o") {
    Write-Host "`n❌ Suppression annulée." -ForegroundColor Yellow
    exit 0
}

$rootPath = "C:\Users\AAA\Documents\iahome"
$projectPath = Join-Path $rootPath "hunyuan2-spz"
$totalFreed = 0

# 1. Arrêter et supprimer les conteneurs Docker
Write-Host "`n[1/8] Arrêt et suppression des conteneurs Docker..." -ForegroundColor Cyan
$containers = docker ps -a --filter "name=hunyuan3d" --format "{{.Names}}" 2>$null
if ($containers) {
    foreach ($container in $containers) {
        Write-Host "  Arrêt de $container..." -ForegroundColor Yellow
        docker stop $container 2>&1 | Out-Null
        docker rm $container 2>&1 | Out-Null
        Write-Host "    ✅ Conteneur supprimé" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Aucun conteneur trouvé" -ForegroundColor Gray
}

# 2. Supprimer les volumes Docker
Write-Host "`n[2/8] Suppression des volumes Docker..." -ForegroundColor Cyan
$volumes = docker volume ls --format "{{.Name}}" 2>$null | Select-String "hunyuan3d"
if ($volumes) {
    foreach ($volume in $volumes) {
        Write-Host "  Suppression du volume $volume..." -ForegroundColor Yellow
        docker volume rm $volume 2>&1 | Out-Null
        Write-Host "    ✅ Volume supprimé" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Aucun volume trouvé" -ForegroundColor Gray
}

# Supprimer aussi via docker-compose si le dossier existe
if (Test-Path $projectPath) {
    Set-Location $projectPath
    Write-Host "  Suppression via docker-compose..." -ForegroundColor Yellow
    docker-compose down -v 2>&1 | Out-Null
    Set-Location $rootPath
}

# 3. Supprimer les images Docker liées à Hunyuan3D
Write-Host "`n[3/8] Suppression des images Docker..." -ForegroundColor Cyan
$images = docker images --format "{{.Repository}}:{{.Tag}}" 2>$null | Select-String "hunyuan"
if ($images) {
    foreach ($image in $images) {
        Write-Host "  Suppression de l'image $image..." -ForegroundColor Yellow
        docker rmi $image -f 2>&1 | Out-Null
        Write-Host "    ✅ Image supprimée" -ForegroundColor Green
    }
} else {
    Write-Host "  ⚠️  Aucune image trouvée" -ForegroundColor Gray
}

# 4. Supprimer le dossier projet
Write-Host "`n[4/8] Suppression du dossier projet..." -ForegroundColor Cyan
if (Test-Path $projectPath) {
    try {
        $size = (Get-ChildItem $projectPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
        Write-Host "  Taille: $([math]::Round($size, 2)) GB" -ForegroundColor Gray
        Remove-Item -Path $projectPath -Recurse -Force -ErrorAction Stop
        $totalFreed += $size
        Write-Host "  ✅ Dossier projet supprimé" -ForegroundColor Green
    } catch {
        Write-Host "  ❌ Erreur lors de la suppression: $_" -ForegroundColor Red
    }
} else {
    Write-Host "  ⚠️  Dossier projet déjà supprimé" -ForegroundColor Gray
}

# 5. Supprimer les modèles Hugging Face dans le cache centralisé
Write-Host "`n[5/8] Suppression des modèles Hugging Face (cache centralisé)..." -ForegroundColor Cyan
$modelsCachePath = Join-Path $rootPath "ai-models-cache\huggingface\hub"
$models = @(
    "models--tencent--Hunyuan3D-2",
    "models--tencent--Hunyuan3D-2mv",
    "models--tencent--Hunyuan3D-2.1",
    "models--Tencent-Hunyuan--HunyuanDiT-v1.1-Diffusers-Distilled"
)

foreach ($model in $models) {
    $modelPath = Join-Path $modelsCachePath $model
    if (Test-Path $modelPath) {
        try {
            $size = (Get-ChildItem $modelPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
            Write-Host "  Suppression de $model ($([math]::Round($size, 2)) GB)..." -ForegroundColor Yellow
            Remove-Item -Path $modelPath -Recurse -Force -ErrorAction Stop
            $totalFreed += $size
            Write-Host "    ✅ Supprimé" -ForegroundColor Green
        } catch {
            Write-Host "    ❌ Erreur: $_" -ForegroundColor Red
        }
    }
}

# 6. Supprimer les modèles Hugging Face dans le cache utilisateur
Write-Host "`n[6/8] Suppression des modèles Hugging Face (cache utilisateur)..." -ForegroundColor Cyan
$userCachePath = Join-Path $env:USERPROFILE ".cache\huggingface\hub"
if (Test-Path $userCachePath) {
    foreach ($model in $models) {
        $modelPath = Join-Path $userCachePath $model
        if (Test-Path $modelPath) {
            try {
                $size = (Get-ChildItem $modelPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
                Write-Host "  Suppression de $model ($([math]::Round($size, 2)) GB)..." -ForegroundColor Yellow
                Remove-Item -Path $modelPath -Recurse -Force -ErrorAction Stop
                $totalFreed += $size
                Write-Host "    ✅ Supprimé" -ForegroundColor Green
            } catch {
                Write-Host "    ❌ Erreur: $_" -ForegroundColor Red
            }
        }
    }
} else {
    Write-Host "  ⚠️  Cache utilisateur non trouvé" -ForegroundColor Gray
}

# 7. Supprimer les fichiers de configuration
Write-Host "`n[7/8] Suppression des fichiers de configuration..." -ForegroundColor Cyan
$configFiles = @(
    (Join-Path $rootPath "traefik\dynamic\hunyuan3d.yml"),
    (Join-Path $rootPath "cloudflare-worker-hunyuan3d.js")
)

foreach ($file in $configFiles) {
    if (Test-Path $file) {
        Remove-Item -Path $file -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Supprimé: $(Split-Path $file -Leaf)" -ForegroundColor Green
    }
}

# Supprimer le middleware de middlewares.yml
$middlewaresFile = Join-Path $rootPath "traefik\dynamic\middlewares.yml"
if (Test-Path $middlewaresFile) {
    try {
        $content = Get-Content $middlewaresFile -Raw -ErrorAction Stop
        $originalContent = $content
        $content = $content -replace "(?s)# Middleware pour les headers de proxy Hunyuan3D\s+hunyuan3d-proxy-headers:.*?X-Forwarded-Proto: `"https`"\s+", ""
        if ($content -ne $originalContent) {
            Set-Content -Path $middlewaresFile -Value $content -NoNewline -ErrorAction Stop
            Write-Host "  ✅ Middleware hunyuan3d-proxy-headers supprimé de middlewares.yml" -ForegroundColor Green
        }
    } catch {
        Write-Host "  ⚠️  Erreur lors de la modification de middlewares.yml: $_" -ForegroundColor Yellow
    }
}

# 8. Supprimer les fichiers temporaires, caches et scripts associés
Write-Host "`n[8/8] Suppression des fichiers temporaires, caches et scripts..." -ForegroundColor Cyan

# Cache Python __pycache__
$pycachePaths = @(
    Join-Path $rootPath "hunyuan2-spz\**\__pycache__"
)
foreach ($path in $pycachePaths) {
    $items = Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue
    if ($items) {
        foreach ($item in $items) {
            Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Host "  ✅ Cache Python supprimé" -ForegroundColor Green
    }
}

# Fichiers temporaires dans le dossier de sortie
$outputPaths = @(
    Join-Path $rootPath "hunyuan2-spz\outputs"
)
foreach ($path in $outputPaths) {
    if (Test-Path $path) {
        try {
            $size = (Get-ChildItem $path -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
            Remove-Item -Path $path -Recurse -Force -ErrorAction Stop
            $totalFreed += $size
            Write-Host "  ✅ Fichiers de sortie supprimés ($([math]::Round($size, 2)) GB)" -ForegroundColor Green
        } catch {
            Write-Host "  ⚠️  Erreur lors de la suppression des outputs: $_" -ForegroundColor Yellow
        }
    }
}

# Supprimer les scripts de monitoring associés
$scriptFiles = @(
    Join-Path $rootPath "scripts\monitor-hunyuan3d.ps1"
)
foreach ($script in $scriptFiles) {
    if (Test-Path $script) {
        Remove-Item -Path $script -Force -ErrorAction SilentlyContinue
        Write-Host "  ✅ Script supprimé: $(Split-Path $script -Leaf)" -ForegroundColor Green
    }
}

# Nettoyer les caches Docker build
Write-Host "  Nettoyage des caches Docker build..." -ForegroundColor Yellow
docker builder prune -f --filter "label=com.docker.compose.project=hunyuan2-spz" 2>&1 | Out-Null
Write-Host "    ✅ Cache Docker nettoyé" -ForegroundColor Green

# Résumé
Write-Host "`n========================================" -ForegroundColor Green
Write-Host "  SUPPRESSION TERMINÉE" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Espace libéré: $([math]::Round($totalFreed, 2)) GB" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Redémarrez Traefik pour appliquer les changements:" -ForegroundColor Yellow
Write-Host "  docker restart iahome-traefik" -ForegroundColor White
Write-Host ""
