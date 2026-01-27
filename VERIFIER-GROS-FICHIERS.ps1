# Script pour vérifier les gros fichiers récemment téléchargés et leur utilité

Write-Host "`n=== VÉRIFICATION DES GROS FICHIERS RÉCENTS ===" -ForegroundColor Cyan
Write-Host "Recherche des fichiers > 1 GB modifiés dans les 30 derniers jours...`n" -ForegroundColor Yellow

$basePath = "C:\Users\AAA\Documents\iahome"
$cachesPath = Join-Path $basePath "ai-models-cache"

# 1. Vérifier le cache Hugging Face
Write-Host "=== CACHE HUGGING FACE ===" -ForegroundColor Cyan
$hfPath = Join-Path $cachesPath "huggingface\hub"
if (Test-Path $hfPath) {
    $models = Get-ChildItem $hfPath -Directory -ErrorAction SilentlyContinue
    if ($models.Count -eq 0) {
        Write-Host "✅ Cache vide (après suppression hunyuan3d)" -ForegroundColor Green
    } else {
        foreach ($model in $models) {
            $size = (Get-ChildItem $model.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
            $lastModified = (Get-ChildItem $model.FullName -Recurse -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
            
            if ($size -gt 0.01) {
                $isRecent = $lastModified -gt (Get-Date).AddDays(-30)
                $color = if ($isRecent) { "Red" } else { "Yellow" }
                
                Write-Host "`n⚠️  $($model.Name)" -ForegroundColor $color
                Write-Host "  Taille: $([math]::Round($size, 2)) GB" -ForegroundColor White
                Write-Host "  Dernière modif: $($lastModified.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor White
                
                # Vérifier l'utilisation
                $modelName = $model.Name
                if ($modelName -like "*stable-diffusion*" -or $modelName -like "*runwayml*") {
                    Write-Host "  ✅ Utilisé par: photo-animation" -ForegroundColor Green
                } elseif ($modelName -like "*tencent*" -or $modelName -like "*Hunyuan*") {
                    Write-Host "  ❌ INUTILE: hunyuan3d supprimé" -ForegroundColor Red
                    Write-Host "  💡 Peut être supprimé" -ForegroundColor Yellow
                } else {
                    Write-Host "  ⚠️  Utilisation inconnue - à vérifier" -ForegroundColor Yellow
                }
            }
        }
    }
} else {
    Write-Host "✅ Cache Hugging Face vide ou inexistant" -ForegroundColor Green
}

# 2. Vérifier le cache PyTorch
Write-Host "`n=== CACHE PYTORCH ===" -ForegroundColor Cyan
$torchPath = Join-Path $cachesPath "torch"
if (Test-Path $torchPath) {
    $size = (Get-ChildItem $torchPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
    if ($size -gt 0.01) {
        Write-Host "Taille: $([math]::Round($size, 2)) GB" -ForegroundColor White
        Write-Host "✅ Utilisé par: voice-isolation-service (Demucs)" -ForegroundColor Green
    } else {
        Write-Host "✅ Cache vide ou minimal" -ForegroundColor Green
    }
} else {
    Write-Host "✅ Cache PyTorch inexistant" -ForegroundColor Green
}

# 3. Vérifier les autres caches
Write-Host "`n=== AUTRES CACHES ===" -ForegroundColor Cyan
$otherCaches = @("whisper", "comfyui")
foreach ($cacheName in $otherCaches) {
    $cachePath = Join-Path $cachesPath $cacheName
    if (Test-Path $cachePath) {
        $size = (Get-ChildItem $cachePath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
        if ($size -gt 0.01) {
            Write-Host "$cacheName : $([math]::Round($size, 2)) GB" -ForegroundColor Yellow
            Write-Host "  ⚠️  Vérifier l'utilisation" -ForegroundColor Yellow
        }
    }
}

# 4. Rechercher les gros fichiers récents dans tout le projet
Write-Host "`n=== GROS FICHIERS RÉCENTS (> 1 GB) ===" -ForegroundColor Cyan
$largeFiles = Get-ChildItem -Path $basePath -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.Length -gt 1GB -and $_.LastWriteTime -gt (Get-Date).AddDays(-30) } | 
    Sort-Object LastWriteTime -Descending

if ($largeFiles.Count -eq 0) {
    Write-Host "✅ Aucun gros fichier récent trouvé" -ForegroundColor Green
} else {
    Write-Host "⚠️  Fichiers trouvés:" -ForegroundColor Yellow
    foreach ($file in $largeFiles) {
        $relativePath = $file.FullName.Replace($basePath + "\", "")
        Write-Host "`n  $relativePath" -ForegroundColor White
        Write-Host "    Taille: $([math]::Round($file.Length / 1GB, 2)) GB" -ForegroundColor Gray
        Write-Host "    Modifié: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
    }
}

Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "✅ Vérification terminée" -ForegroundColor Green
Write-Host "`nModèles nécessaires pour les applications actives:" -ForegroundColor Yellow
Write-Host "  - photo-animation: runwayml/stable-diffusion-v1-5 (~4-5 GB)" -ForegroundColor White
Write-Host "  - voice-isolation: htdemucs (PyTorch, ~0.08 GB)" -ForegroundColor White
