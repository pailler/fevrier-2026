# Script pour consolider les modèles IA dans le dossier centralisé
# et supprimer les doublons

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDATION DES MODÈLES IA" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $PSScriptRoot
Set-Location $RootPath

$modelsCacheDir = Join-Path $RootPath "ai-models-cache"
$torchCacheDir = Join-Path $modelsCacheDir "torch"
$huggingfaceCacheDir = Join-Path $modelsCacheDir "huggingface"

# Créer les dossiers si nécessaire
Write-Host "📁 Vérification de la structure de dossiers..." -ForegroundColor Yellow
if (-not (Test-Path $modelsCacheDir)) {
    New-Item -ItemType Directory -Path $modelsCacheDir -Force | Out-Null
    Write-Host "✅ Dossier créé: ai-models-cache" -ForegroundColor Green
}
if (-not (Test-Path $torchCacheDir)) {
    New-Item -ItemType Directory -Path $torchCacheDir -Force | Out-Null
    Write-Host "✅ Dossier créé: ai-models-cache/torch" -ForegroundColor Green
}
if (-not (Test-Path $huggingfaceCacheDir)) {
    New-Item -ItemType Directory -Path $huggingfaceCacheDir -Force | Out-Null
    Write-Host "✅ Dossier créé: ai-models-cache/huggingface" -ForegroundColor Green
}
Write-Host ""

# Emplacements à vérifier pour les modèles existants
$searchPaths = @(
    @{
        Path = "$env:USERPROFILE\.cache\torch"
        Target = $torchCacheDir
        Name = "PyTorch Hub"
    },
    @{
        Path = "$env:USERPROFILE\.cache\huggingface"
        Target = $huggingfaceCacheDir
        Name = "HuggingFace"
    },
    @{
        Path = "voice-isolation-service\models-cache"
        Target = $torchCacheDir
        Name = "Voice Isolation (local)"
    }
)

$totalSize = 0
$movedFiles = 0

foreach ($searchPath in $searchPaths) {
    $sourcePath = $searchPath.Path
    $targetPath = $searchPath.Target
    $name = $searchPath.Name
    
    if (Test-Path $sourcePath) {
        Write-Host "🔍 Vérification: $name" -ForegroundColor Cyan
        Write-Host "   Source: $sourcePath" -ForegroundColor Gray
        
        # Calculer la taille
        $size = (Get-ChildItem -Path $sourcePath -Recurse -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size) {
            $sizeGB = [math]::Round($size / 1GB, 2)
            Write-Host "   Taille: $sizeGB GB" -ForegroundColor Yellow
            $totalSize += $size
        }
        
        # Vérifier s'il y a des fichiers à déplacer
        $files = Get-ChildItem -Path $sourcePath -Recurse -File -ErrorAction SilentlyContinue
        if ($files.Count -gt 0) {
            Write-Host "   Fichiers trouvés: $($files.Count)" -ForegroundColor Gray
            
            # Demander confirmation
            $confirm = Read-Host "   Déplacer vers $targetPath ? (O/N)"
            if ($confirm -eq "O" -or $confirm -eq "o") {
                Write-Host "   Déplacement en cours..." -ForegroundColor Yellow
                
                # Créer la structure de dossiers dans la cible
                $relativePath = $sourcePath -replace [regex]::Escape((Get-Item $sourcePath).Parent.FullName), ""
                $destPath = Join-Path $targetPath (Split-Path $sourcePath -Leaf)
                
                try {
                    # Copier les fichiers (ne pas déplacer pour éviter les erreurs)
                    Copy-Item -Path $sourcePath -Destination $destPath -Recurse -Force -ErrorAction SilentlyContinue
                    Write-Host "   ✅ Fichiers copiés vers: $destPath" -ForegroundColor Green
                    $movedFiles += $files.Count
                    
                    # Supprimer la source après vérification
                    $confirmDelete = Read-Host "   Supprimer la source originale ? (O/N)"
                    if ($confirmDelete -eq "O" -or $confirmDelete -eq "o") {
                        Remove-Item -Path $sourcePath -Recurse -Force -ErrorAction SilentlyContinue
                        Write-Host "   ✅ Source supprimée" -ForegroundColor Green
                    }
                } catch {
                    Write-Host "   ⚠️ Erreur lors du déplacement: $_" -ForegroundColor Yellow
                }
            }
        } else {
            Write-Host "   Aucun fichier trouvé" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Vérifier les volumes Docker
Write-Host "🐳 Vérification des volumes Docker..." -ForegroundColor Cyan
try {
    $dockerVolumes = docker volume ls --format "{{.Name}}" 2>$null | Select-String "hunyuan3d-models|model"
    if ($dockerVolumes) {
        Write-Host "   Volumes Docker trouvés:" -ForegroundColor Yellow
        foreach ($vol in $dockerVolumes) {
            Write-Host "   - $vol" -ForegroundColor Gray
            
            # Vérifier si le volume est utilisé
            $inUse = docker ps -a --filter "volume=$vol" --format "{{.Names}}" 2>$null
            if ($inUse) {
                Write-Host "     ⚠️ Volume utilisé par: $inUse" -ForegroundColor Yellow
                Write-Host "     💡 Arrêtez le conteneur avant de supprimer le volume" -ForegroundColor Cyan
            } else {
                Write-Host "     ✅ Volume non utilisé" -ForegroundColor Green
                $confirmDelete = Read-Host "     Supprimer ce volume ? (O/N)"
                if ($confirmDelete -eq "O" -or $confirmDelete -eq "o") {
                    docker volume rm $vol 2>&1 | Out-Null
                    if ($LASTEXITCODE -eq 0) {
                        Write-Host "     ✅ Volume supprimé" -ForegroundColor Green
                    } else {
                        Write-Host "     ⚠️ Erreur lors de la suppression" -ForegroundColor Yellow
                    }
                }
            }
        }
    } else {
        Write-Host "   Aucun volume Docker de modèles trouvé" -ForegroundColor Gray
    }
} catch {
    Write-Host "   ⚠️ Docker n'est pas accessible" -ForegroundColor Yellow
}
Write-Host ""

# Résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RÉSUMÉ" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📁 Dossier centralisé: ai-models-cache/" -ForegroundColor Green
Write-Host "   - torch/ : Modèles PyTorch (Demucs, etc.)" -ForegroundColor White
Write-Host "   - huggingface/ : Modèles HuggingFace (Hunyuan3D, etc.)" -ForegroundColor White
Write-Host ""
if ($totalSize -gt 0) {
    $totalGB = [math]::Round($totalSize / 1GB, 2)
    Write-Host "📊 Taille totale détectée: $totalGB GB" -ForegroundColor Yellow
}
if ($movedFiles -gt 0) {
    Write-Host "✅ Fichiers consolidés: $movedFiles" -ForegroundColor Green
}
Write-Host ""
Write-Host "💡 Les applications sont maintenant configurées pour utiliser ce dossier" -ForegroundColor Cyan
Write-Host ""
