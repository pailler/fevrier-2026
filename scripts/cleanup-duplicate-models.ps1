# Script pour supprimer automatiquement les doublons de modèles
# et vider les caches de modèles existants

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NETTOYAGE DES DOUBLONS DE MODÈLES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $PSScriptRoot
Set-Location $RootPath

$modelsCacheDir = Join-Path $RootPath "ai-models-cache"

# Emplacements à nettoyer (doublons)
$cleanupPaths = @(
    @{
        Path = "$env:USERPROFILE\.cache\torch"
        Name = "PyTorch Hub (utilisateur)"
        Keep = $false
    },
    @{
        Path = "$env:USERPROFILE\.cache\huggingface"
        Name = "HuggingFace (utilisateur)"
        Keep = $false
    },
    @{
        Path = "voice-isolation-service\models-cache"
        Name = "Voice Isolation (local)"
        Keep = $false
    }
)

$totalFreed = 0
$deletedCount = 0

Write-Host "🧹 Nettoyage des caches de modèles...`n" -ForegroundColor Yellow

foreach ($cleanupPath in $cleanupPaths) {
    $sourcePath = $cleanupPath.Path
    $name = $cleanupPath.Name
    
    if (Test-Path $sourcePath) {
        Write-Host "🔍 Vérification: $name" -ForegroundColor Cyan
        Write-Host "   Chemin: $sourcePath" -ForegroundColor Gray
        
        # Calculer la taille
        $size = (Get-ChildItem -Path $sourcePath -Recurse -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size) {
            $sizeGB = [math]::Round($size / 1GB, 2)
            Write-Host "   Taille: $sizeGB GB" -ForegroundColor Yellow
            
            # Supprimer le dossier
            Write-Host "   🗑️  Suppression en cours..." -ForegroundColor Yellow
            try {
                Remove-Item -Path $sourcePath -Recurse -Force -ErrorAction Stop
                Write-Host "   ✅ Supprimé avec succès" -ForegroundColor Green
                $totalFreed += $size
                $deletedCount++
            } catch {
                Write-Host "   ⚠️ Erreur lors de la suppression: $_" -ForegroundColor Red
            }
        } else {
            Write-Host "   ℹ️  Dossier vide ou inaccessible" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Vérifier et nettoyer les volumes Docker inutilisés
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
                    $deletedCount++
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

if ($totalFreed -gt 0) {
    $totalGB = [math]::Round($totalFreed / 1GB, 2)
    Write-Host "✅ Espace libéré: $totalGB GB" -ForegroundColor Green
    Write-Host "✅ Éléments supprimés: $deletedCount" -ForegroundColor Green
} else {
    Write-Host "✅ Aucun doublon trouvé" -ForegroundColor Green
}

Write-Host ""
Write-Host "💡 Les modèles sont maintenant centralisés dans: ai-models-cache/" -ForegroundColor Cyan
Write-Host ""
