# Script pour vider le cache Hugging Face de manière sélective

Write-Host "=== NETTOYAGE SÉLECTIF DU CACHE HUGGING FACE ===" -ForegroundColor Cyan
Write-Host ""

$cachePath = "$env:USERPROFILE\.cache\huggingface"

if (-not (Test-Path $cachePath)) {
    Write-Host "Le cache Hugging Face n'existe pas à l'emplacement: $cachePath" -ForegroundColor Yellow
    exit
}

# Afficher les modèles dans le cache
Write-Host "Modèles trouvés dans le cache:" -ForegroundColor Yellow
$models = Get-ChildItem -Path "$cachePath\hub" -Directory -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -like "models--*" }

foreach ($model in $models) {
    $modelName = $model.Name -replace "models--", "" -replace "--", "/"
    $modelSize = (Get-ChildItem -Path $model.FullName -Recurse -ErrorAction SilentlyContinue | 
        Measure-Object -Property Length -Sum).Sum
    $modelSizeGB = [math]::Round($modelSize / 1GB, 2)
    Write-Host "  - $modelName : $modelSizeGB GB" -ForegroundColor White
}

Write-Host ""

# Calculer la taille totale
$totalSize = (Get-ChildItem -Path $cachePath -Recurse -ErrorAction SilentlyContinue | 
    Measure-Object -Property Length -Sum).Sum
$totalSizeGB = [math]::Round($totalSize / 1GB, 2)

Write-Host "Taille totale du cache: $totalSizeGB GB" -ForegroundColor Yellow
Write-Host ""

# Options
Write-Host "Options de nettoyage:" -ForegroundColor Cyan
Write-Host "1. Supprimer TOUT le cache (libère ~$totalSizeGB GB)" -ForegroundColor White
Write-Host "2. Supprimer uniquement les modèles Hunyuan3D" -ForegroundColor White
Write-Host "3. Supprimer les snapshots inutilisés" -ForegroundColor White
Write-Host "4. Annuler" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Votre choix (1-4)"

switch ($choice) {
    "1" {
        Write-Host "Suppression de tout le cache..." -ForegroundColor Yellow
        Remove-Item -Path "$cachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
        Write-Host "✓ Cache entièrement vidé !" -ForegroundColor Green
    }
    "2" {
        Write-Host "Suppression des modèles Hunyuan3D..." -ForegroundColor Yellow
        $hunyuanModels = Get-ChildItem -Path "$cachePath\hub\models--*" -Directory -ErrorAction SilentlyContinue | 
            Where-Object { $_.Name -like "*hunyuan*" -or $_.Name -like "*Hunyuan*" }
        foreach ($model in $hunyuanModels) {
            Write-Host "  Suppression de $($model.Name)..." -ForegroundColor Gray
            Remove-Item -Path $model.FullName -Recurse -Force -ErrorAction SilentlyContinue
        }
        Write-Host "✓ Modèles Hunyuan3D supprimés !" -ForegroundColor Green
    }
    "3" {
        Write-Host "Suppression des snapshots inutilisés..." -ForegroundColor Yellow
        # Cette option nécessiterait une analyse plus poussée
        Write-Host "Option non implémentée. Utilisez l'option 1 pour tout supprimer." -ForegroundColor Yellow
    }
    "4" {
        Write-Host "Opération annulée." -ForegroundColor Red
        exit
    }
    default {
        Write-Host "Choix invalide. Opération annulée." -ForegroundColor Red
        exit
    }
}

Write-Host ""
Write-Host "=== NETTOYAGE TERMINÉ ===" -ForegroundColor Cyan

