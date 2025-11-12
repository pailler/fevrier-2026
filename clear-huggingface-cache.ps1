# Script pour vider le cache Hugging Face

Write-Host "=== NETTOYAGE DU CACHE HUGGING FACE ===" -ForegroundColor Cyan
Write-Host ""

$cachePath = "$env:USERPROFILE\.cache\huggingface"

if (-not (Test-Path $cachePath)) {
    Write-Host "Le cache Hugging Face n'existe pas à l'emplacement: $cachePath" -ForegroundColor Yellow
    exit
}

# Calculer la taille avant suppression
Write-Host "Calcul de la taille du cache..." -ForegroundColor Yellow
$sizeBefore = (Get-ChildItem -Path $cachePath -Recurse -ErrorAction SilentlyContinue | 
    Measure-Object -Property Length -Sum).Sum
$sizeBeforeGB = [math]::Round($sizeBefore / 1GB, 2)
$sizeBeforeMB = [math]::Round($sizeBefore / 1MB, 2)

Write-Host "Taille actuelle du cache: $sizeBeforeGB GB ($sizeBeforeMB MB)" -ForegroundColor Yellow
Write-Host ""

# Demander confirmation
$confirmation = Read-Host "Voulez-vous supprimer le cache Hugging Face ? (O/N)"
if ($confirmation -ne "O" -and $confirmation -ne "o" -and $confirmation -ne "Y" -and $confirmation -ne "y") {
    Write-Host "Opération annulée." -ForegroundColor Red
    exit
}

Write-Host ""
Write-Host "Suppression du cache en cours..." -ForegroundColor Yellow

try {
    # Supprimer le contenu du cache
    Remove-Item -Path "$cachePath\*" -Recurse -Force -ErrorAction SilentlyContinue
    
    # Vérifier si le dossier est vide maintenant
    $remaining = Get-ChildItem -Path $cachePath -Recurse -ErrorAction SilentlyContinue
    if ($remaining) {
        Write-Host "Certains fichiers n'ont pas pu être supprimés. Tentative de suppression forcée..." -ForegroundColor Yellow
        # Essayer de supprimer le dossier entier et le recréer
        Remove-Item -Path $cachePath -Recurse -Force -ErrorAction SilentlyContinue
        New-Item -ItemType Directory -Path $cachePath -Force | Out-Null
    }
    
    Write-Host ""
    Write-Host "✓ Cache Hugging Face vidé avec succès !" -ForegroundColor Green
    Write-Host "Espace libéré: $sizeBeforeGB GB ($sizeBeforeMB MB)" -ForegroundColor Green
    
} catch {
    Write-Host ""
    Write-Host "Erreur lors de la suppression: $_" -ForegroundColor Red
    Write-Host "Vous pouvez essayer de supprimer manuellement le dossier: $cachePath" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== NETTOYAGE TERMINÉ ===" -ForegroundColor Cyan

