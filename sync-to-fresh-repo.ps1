# Script pour synchroniser les modifications vers le nouveau dépôt
param(
    [string]$SourceDir = "C:\Users\AAA\Documents\iahome",
    [string]$DestDir = "C:\Users\AAA\Documents\iahome-fresh-repo"
)

Write-Host "Synchronisation vers le nouveau depot..." -ForegroundColor Cyan

# Obtenir la liste des fichiers modifiés
Set-Location $SourceDir
$modifiedFiles = git diff --name-only HEAD~1 HEAD

Write-Host "Fichiers a copier: $($modifiedFiles.Count)" -ForegroundColor Yellow

# Copier les fichiers
foreach ($file in $modifiedFiles) {
    $source = Join-Path $SourceDir $file
    $dest = Join-Path $DestDir $file
    $destDir = Split-Path $dest -Parent
    
    if ($destDir -and -not (Test-Path $destDir)) {
        New-Item -ItemType Directory -Path $destDir -Force | Out-Null
    }
    
    if (Test-Path $source) {
        Copy-Item -Path $source -Destination $dest -Force -ErrorAction SilentlyContinue
        Write-Host "  Copie: $file" -ForegroundColor Gray
    }
}

Write-Host "Copie terminee" -ForegroundColor Green

# Faire le commit et push dans le nouveau depot
Set-Location $DestDir
Write-Host "Commit et push dans le nouveau depot..." -ForegroundColor Cyan

git add -A
git commit -m "Update: ameliorations et corrections diverses"
git push origin main

Write-Host "Termine!" -ForegroundColor Green


