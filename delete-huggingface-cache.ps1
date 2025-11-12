# Script pour supprimer le cache Hugging Face

$cachePath = "$env:USERPROFILE\.cache\huggingface"

Write-Host "=== SUPPRESSION DU CACHE HUGGING FACE ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $cachePath)) {
    Write-Host "Le cache Hugging Face n'existe pas a l'emplacement: $cachePath" -ForegroundColor Yellow
    exit
}

# Calculer la taille avant suppression
Write-Host "Calcul de la taille du cache..." -ForegroundColor Yellow
$size = (Get-ChildItem -Path $cachePath -Recurse -ErrorAction SilentlyContinue | 
    Measure-Object -Property Length -Sum).Sum
$sizeGB = [math]::Round($size / 1GB, 2)
$sizeMB = [math]::Round($size / 1MB, 2)

Write-Host "Taille actuelle: $sizeGB GB ($sizeMB MB)" -ForegroundColor Yellow
Write-Host ""

# Supprimer le cache
Write-Host "Suppression en cours..." -ForegroundColor Yellow
try {
    Remove-Item -Path $cachePath -Recurse -Force -ErrorAction Stop
    
    Write-Host ""
    Write-Host "[SUCCES] Cache Hugging Face supprime avec succes !" -ForegroundColor Green
    Write-Host "Espace libere: $sizeGB GB ($sizeMB MB)" -ForegroundColor Green
} catch {
    Write-Host ""
    Write-Host "[ERREUR] Erreur lors de la suppression: $_" -ForegroundColor Red
    Write-Host ""
    Write-Host "Tentative de suppression manuelle..." -ForegroundColor Yellow
    
    # Essayer de supprimer les fichiers un par un
    Get-ChildItem -Path $cachePath -Recurse -ErrorAction SilentlyContinue | 
        Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
    
    # Supprimer le dossier principal s'il est vide
    if ((Get-ChildItem -Path $cachePath -ErrorAction SilentlyContinue).Count -eq 0) {
        Remove-Item -Path $cachePath -Force -ErrorAction SilentlyContinue
        Write-Host "[SUCCES] Cache supprime (methode alternative)" -ForegroundColor Green
    } else {
        Write-Host "[ATTENTION] Certains fichiers n'ont pas pu etre supprimes." -ForegroundColor Yellow
        Write-Host "Vous pouvez essayer de supprimer manuellement: $cachePath" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "=== OPERATION TERMINEE ===" -ForegroundColor Cyan

