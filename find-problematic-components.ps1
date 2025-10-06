# Script pour identifier les composants problématiques
Write-Host "🔍 Recherche des composants problématiques..." -ForegroundColor Cyan

# Rechercher tous les fichiers qui utilisent des event handlers
$filesWithEventHandlers = Get-ChildItem -Path "src" -Recurse -Include "*.tsx", "*.ts" | ForEach-Object {
    $content = Get-Content $_.FullName -Raw
    if ($content -match "onClick|onKeyDown|onKeyPress|onChange|onLoad|onError|onSubmit|onFocus|onBlur") {
        $_.FullName
    }
}

Write-Host "Fichiers avec event handlers trouvés: $($filesWithEventHandlers.Count)" -ForegroundColor Yellow

# Vérifier lesquels n'ont pas 'use client'
$problematicFiles = @()
foreach ($file in $filesWithEventHandlers) {
    $content = Get-Content $file -Raw
    if ($content -notmatch "^'use client'") {
        $problematicFiles += $file
    }
}

Write-Host "`nFichiers problématiques (sans 'use client'):" -ForegroundColor Red
foreach ($file in $problematicFiles) {
    $relativePath = $file.Replace((Get-Location).Path + "\", "")
    Write-Host "  - $relativePath" -ForegroundColor Red
}

Write-Host "`nTotal de fichiers problématiques: $($problematicFiles.Count)" -ForegroundColor Red


