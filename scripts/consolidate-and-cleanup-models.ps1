# Script pour consolider les modèles IA et supprimer les doublons
# Copie d'abord vers le dossier centralisé, puis supprime les originaux

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONSOLIDATION ET NETTOYAGE DES MODÈLES" -ForegroundColor Cyan
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

# Emplacements à consolider
$consolidatePaths = @(
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
$copiedFiles = 0
$deletedFiles = 0
$skippedFiles = 0

foreach ($consolidatePath in $consolidatePaths) {
    $sourcePath = $consolidatePath.Path
    $targetPath = $consolidatePath.Target
    $name = $consolidatePath.Name
    
    if (Test-Path $sourcePath) {
        Write-Host "🔍 Traitement: $name" -ForegroundColor Cyan
        Write-Host "   Source: $sourcePath" -ForegroundColor Gray
        
        # Calculer la taille
        $size = (Get-ChildItem -Path $sourcePath -Recurse -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size) {
            $sizeGB = [math]::Round($size / 1GB, 2)
            Write-Host "   Taille: $sizeGB GB" -ForegroundColor Yellow
            $totalSize += $size
            
            # Obtenir tous les fichiers
            $allItems = Get-ChildItem -Path $sourcePath -Recurse -ErrorAction SilentlyContinue
            
            if ($allItems.Count -gt 0) {
                Write-Host "   📦 Éléments trouvés: $($allItems.Count)" -ForegroundColor Gray
                Write-Host "   📋 Copie vers le dossier centralisé..." -ForegroundColor Yellow
                
                $copied = 0
                $failed = 0
                
                # Copier récursivement en gérant les erreurs
                try {
                    # Utiliser robocopy pour une copie plus robuste (Windows)
                    $destPath = Join-Path $targetPath (Split-Path $sourcePath -Leaf)
                    
                    # Créer le dossier de destination
                    if (-not (Test-Path $destPath)) {
                        New-Item -ItemType Directory -Path $destPath -Force | Out-Null
                    }
                    
                    # Copier avec robocopy (ignore les fichiers verrouillés)
                    $robocopyResult = & robocopy $sourcePath $destPath /E /COPYALL /R:1 /W:1 /NP /NFL /NDL 2>&1
                    
                    # Analyser le résultat de robocopy
                    $exitCode = $LASTEXITCODE
                    # Robocopy retourne 0-7 pour succès, 8+ pour erreurs partielles
                    if ($exitCode -le 7) {
                        Write-Host "   ✅ Copie réussie" -ForegroundColor Green
                        $copiedFiles += $allItems.Count
                        
                        # Supprimer la source (seulement les fichiers copiés avec succès)
                        Write-Host "   🗑️  Suppression de la source..." -ForegroundColor Yellow
                        try {
                            # Supprimer récursivement, en ignorant les erreurs pour les fichiers verrouillés
                            Get-ChildItem -Path $sourcePath -Recurse -ErrorAction SilentlyContinue | 
                                Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
                            
                            # Supprimer le dossier source s'il est vide
                            if ((Get-ChildItem -Path $sourcePath -ErrorAction SilentlyContinue).Count -eq 0) {
                                Remove-Item -Path $sourcePath -Force -ErrorAction SilentlyContinue
                            }
                            
                            Write-Host "   ✅ Source nettoyée" -ForegroundColor Green
                            $deletedFiles++
                        } catch {
                            Write-Host "   ⚠️ Certains fichiers n'ont pas pu être supprimés (peut-être en cours d'utilisation)" -ForegroundColor Yellow
                            Write-Host "      Ils seront ignorés, les modèles sont déjà dans le dossier centralisé" -ForegroundColor Gray
                        }
                    } else {
                        Write-Host "   ⚠️ Copie partielle (certains fichiers peuvent être verrouillés)" -ForegroundColor Yellow
                        Write-Host "      Les fichiers copiés sont dans le dossier centralisé" -ForegroundColor Gray
                    }
                } catch {
                    Write-Host "   ⚠️ Erreur lors de la copie: $_" -ForegroundColor Yellow
                    $skippedFiles++
                }
            } else {
                Write-Host "   ℹ️  Aucun fichier à copier" -ForegroundColor Gray
            }
        } else {
            Write-Host "   ℹ️  Dossier vide" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Vérifier et nettoyer les volumes Docker
Write-Host "🐳 Vérification des volumes Docker..." -ForegroundColor Cyan
try {
    $dockerVolumes = docker volume ls --format "{{.Name}}" 2>$null | Select-String "hunyuan3d-models"
    if ($dockerVolumes) {
        Write-Host "   Volumes Docker trouvés:" -ForegroundColor Yellow
        foreach ($vol in $dockerVolumes) {
            Write-Host "   - $vol" -ForegroundColor Gray
            
            # Vérifier si le volume est utilisé
            $inUse = docker ps -a --filter "volume=$vol" --format "{{.Names}}" 2>$null
            if ($inUse) {
                Write-Host "     ⚠️ Volume utilisé par: $inUse" -ForegroundColor Yellow
                Write-Host "     💡 Arrêtez le conteneur avant de supprimer" -ForegroundColor Cyan
            } else {
                Write-Host "     🗑️  Suppression du volume..." -ForegroundColor Yellow
                docker volume rm $vol 2>&1 | Out-Null
                if ($LASTEXITCODE -eq 0) {
                    Write-Host "     ✅ Volume supprimé" -ForegroundColor Green
                    $deletedFiles++
                } else {
                    Write-Host "     ⚠️ Erreur lors de la suppression" -ForegroundColor Yellow
                }
            }
        }
    } else {
        Write-Host "   ✅ Aucun volume Docker de modèles à nettoyer" -ForegroundColor Green
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
    Write-Host "📊 Taille totale traitée: $totalGB GB" -ForegroundColor Yellow
}

if ($copiedFiles -gt 0) {
    Write-Host "✅ Fichiers consolidés: $copiedFiles" -ForegroundColor Green
}

if ($deletedFiles -gt 0) {
    Write-Host "🗑️  Sources nettoyées: $deletedFiles" -ForegroundColor Green
}

if ($skippedFiles -gt 0) {
    Write-Host "⚠️  Éléments ignorés (verrouillés): $skippedFiles" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "💡 Les modèles sont maintenant centralisés dans: ai-models-cache/" -ForegroundColor Cyan
Write-Host "   Les applications utiliseront ce dossier au prochain redémarrage" -ForegroundColor Gray
Write-Host ""
