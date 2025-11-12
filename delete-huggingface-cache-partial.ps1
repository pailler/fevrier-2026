# Script pour supprimer les parties accessibles du cache Hugging Face

$cachePath = "$env:USERPROFILE\.cache\huggingface"

Write-Host "=== SUPPRESSION PARTIELLE DU CACHE HUGGING FACE ===" -ForegroundColor Cyan
Write-Host ""

if (-not (Test-Path $cachePath)) {
    Write-Host "Le cache Hugging Face n'existe pas." -ForegroundColor Yellow
    exit
}

# Supprimer le dossier hub (contient les modèles - la partie la plus volumineuse)
Write-Host "Suppression du dossier hub (modeles)..." -ForegroundColor Yellow
$hubPath = Join-Path $cachePath "hub"
if (Test-Path $hubPath) {
    try {
        $hubSize = (Get-ChildItem -Path $hubPath -Recurse -ErrorAction SilentlyContinue | 
            Measure-Object -Property Length -Sum).Sum
        $hubSizeGB = [math]::Round($hubSize / 1GB, 2)
        
        Remove-Item -Path $hubPath -Recurse -Force -ErrorAction Stop
        Write-Host "[SUCCES] Dossier hub supprime ($hubSizeGB GB liberes)" -ForegroundColor Green
    } catch {
        Write-Host "[ERREUR] Impossible de supprimer le dossier hub: $_" -ForegroundColor Red
    }
} else {
    Write-Host "[INFO] Le dossier hub n'existe pas deja." -ForegroundColor Yellow
}

Write-Host ""

# Supprimer les autres dossiers accessibles
Write-Host "Suppression des autres dossiers accessibles..." -ForegroundColor Yellow
$deletedCount = 0
$deletedSize = 0

Get-ChildItem -Path $cachePath -Directory -ErrorAction SilentlyContinue | ForEach-Object {
    $dirName = $_.Name
    $dirPath = $_.FullName
    
    try {
        $dirSize = (Get-ChildItem -Path $dirPath -Recurse -ErrorAction SilentlyContinue | 
            Measure-Object -Property Length -Sum).Sum
        
        Remove-Item -Path $dirPath -Recurse -Force -ErrorAction Stop
        $deletedCount++
        $deletedSize += $dirSize
        Write-Host "[OK] $dirName supprime" -ForegroundColor Green
    } catch {
        Write-Host "[SKIP] $dirName - fichier en cours d'utilisation ou acces refuse" -ForegroundColor Yellow
    }
}

# Calculer l'espace restant
$remaining = (Get-ChildItem -Path $cachePath -Recurse -ErrorAction SilentlyContinue | 
    Measure-Object -Property Length -Sum).Sum

Write-Host ""
Write-Host "=== RESUME ===" -ForegroundColor Cyan
if ($deletedSize -gt 0) {
    $deletedSizeGB = [math]::Round($deletedSize / 1GB, 2)
    Write-Host "Espace libere: $deletedSizeGB GB" -ForegroundColor Green
    Write-Host "Dossiers supprimes: $deletedCount" -ForegroundColor Green
}

if ($remaining -gt 0) {
    $remainingGB = [math]::Round($remaining / 1GB, 2)
    Write-Host "Espace restant: $remainingGB GB (fichiers verrouilles)" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour supprimer les fichiers restants:" -ForegroundColor Yellow
    Write-Host "1. Fermez tous les programmes utilisant Hugging Face" -ForegroundColor White
    Write-Host "2. Redemarrez votre ordinateur" -ForegroundColor White
    Write-Host "3. Relancez ce script ou supprimez manuellement: $cachePath" -ForegroundColor White
} else {
    Write-Host ""
    Write-Host "[SUCCES] Cache entierement supprime !" -ForegroundColor Green
}

Write-Host ""
Write-Host "=== OPERATION TERMINEE ===" -ForegroundColor Cyan

