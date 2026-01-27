# Script pour nettoyer les gros fichiers temporaires Windows

Write-Host "`n=== NETTOYAGE DES FICHIERS TEMPORAIRES WINDOWS ===" -ForegroundColor Cyan
Write-Host "Ce script va supprimer les gros fichiers inutiles du dossier temp.`n" -ForegroundColor Yellow

$tempDir = $env:TEMP
$totalSize = 0
$filesToDelete = @()

# 1. Fichiers swap.vhdx (WSL/Docker)
Write-Host "=== FICHIERS SWAP.VHDX (WSL/Docker) ===" -ForegroundColor Cyan
$swapFiles = Get-ChildItem $tempDir -Recurse -File -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -eq "swap.vhdx" -and $_.Length -gt 1GB }

if ($swapFiles.Count -gt 0) {
    $swapTotal = ($swapFiles | Measure-Object -Property Length -Sum).Sum / 1GB
    Write-Host "Trouvé: $($swapFiles.Count) fichiers swap.vhdx ($([math]::Round($swapTotal, 2)) GB)" -ForegroundColor Yellow
    
    foreach ($file in $swapFiles) {
        $size = $file.Length / 1GB
        $age = (Get-Date) - $file.LastWriteTime
        Write-Host "  - $($file.DirectoryName.Replace($tempDir + '\', ''))" -ForegroundColor White
        Write-Host "    Taille: $([math]::Round($size, 2)) GB | Âge: $($age.Days) jours" -ForegroundColor Gray
        $filesToDelete += $file
        $totalSize += $size
    }
} else {
    Write-Host "✅ Aucun fichier swap.vhdx trouvé" -ForegroundColor Green
}

# 2. Dossier wsl-crashes
Write-Host "`n=== DOSSIER WSL-CRASHES ===" -ForegroundColor Cyan
$wslCrashesPath = Join-Path $tempDir "wsl-crashes"
if (Test-Path $wslCrashesPath) {
    $size = (Get-ChildItem $wslCrashesPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
    if ($size -gt 0.1) {
        Write-Host "Trouvé: $([math]::Round($size, 2)) GB" -ForegroundColor Yellow
        $filesToDelete += Get-Item $wslCrashesPath
        $totalSize += $size
    }
} else {
    Write-Host "✅ Dossier wsl-crashes non trouvé" -ForegroundColor Green
}

# 3. Dossier DockerDesktop (anciens fichiers)
Write-Host "`n=== DOSSIER DOCKERDESKTOP (anciens fichiers) ===" -ForegroundColor Cyan
$dockerPath = Join-Path $tempDir "DockerDesktop"
if (Test-Path $dockerPath) {
    $size = (Get-ChildItem $dockerPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
    if ($size -gt 0.1) {
        Write-Host "Trouvé: $([math]::Round($size, 2)) GB" -ForegroundColor Yellow
        $filesToDelete += Get-Item $dockerPath
        $totalSize += $size
    }
} else {
    Write-Host "✅ Dossier DockerDesktop non trouvé" -ForegroundColor Green
}

# 4. Dossier DockerDesktopUpdates
Write-Host "`n=== DOSSIER DOCKERDESKTOPUPDATES ===" -ForegroundColor Cyan
$dockerUpdatesPath = Join-Path $tempDir "DockerDesktopUpdates"
if (Test-Path $dockerUpdatesPath) {
    $size = (Get-ChildItem $dockerUpdatesPath -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
    if ($size -gt 0.1) {
        Write-Host "Trouvé: $([math]::Round($size, 2)) GB" -ForegroundColor Yellow
        $filesToDelete += Get-Item $dockerUpdatesPath
        $totalSize += $size
    }
} else {
    Write-Host "✅ Dossier DockerDesktopUpdates non trouvé" -ForegroundColor Green
}

# 5. Anciens installateurs VSCode
Write-Host "`n=== ANCIENS INSTALLATEURS VSCODE ===" -ForegroundColor Cyan
$vscodeDirs = Get-ChildItem $tempDir -Directory -ErrorAction SilentlyContinue | 
    Where-Object { $_.Name -like "vscode-stable-user-x64-*" }

if ($vscodeDirs.Count -gt 0) {
    $vscodeTotal = 0
    foreach ($dir in $vscodeDirs) {
        $size = (Get-ChildItem $dir.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
        $vscodeTotal += $size
    }
    if ($vscodeTotal -gt 0.1) {
        Write-Host "Trouvé: $($vscodeDirs.Count) dossiers ($([math]::Round($vscodeTotal, 2)) GB)" -ForegroundColor Yellow
        $filesToDelete += $vscodeDirs
        $totalSize += $vscodeTotal
    }
} else {
    Write-Host "✅ Aucun ancien installateur VSCode trouvé" -ForegroundColor Green
}

# Résumé
Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
Write-Host "📊 Espace total à libérer: $([math]::Round($totalSize, 2)) GB" -ForegroundColor Yellow
Write-Host "📁 Éléments à supprimer: $($filesToDelete.Count)" -ForegroundColor Yellow

if ($filesToDelete.Count -eq 0) {
    Write-Host "`n✅ Aucun fichier à supprimer!" -ForegroundColor Green
    exit 0
}

Write-Host "`n⚠️  ATTENTION: Cette action est irréversible!" -ForegroundColor Red
Write-Host "Voulez-vous supprimer ces fichiers ? (O/N)" -ForegroundColor Yellow
$response = Read-Host

if ($response -ne "O" -and $response -ne "o") {
    Write-Host "`n❌ Suppression annulée." -ForegroundColor Yellow
    exit 0
}

# Suppression
Write-Host "`n🗑️  Suppression en cours..." -ForegroundColor Cyan
$deleted = 0
$errors = 0

foreach ($item in $filesToDelete) {
    try {
        if ($item.PSIsContainer) {
            Remove-Item -Path $item.FullName -Recurse -Force -ErrorAction Stop
        } else {
            Remove-Item -Path $item.FullName -Force -ErrorAction Stop
        }
        $deleted++
        Write-Host "  ✅ Supprimé: $(Split-Path $item.FullName -Leaf)" -ForegroundColor Green
    } catch {
        $errors++
        Write-Host "  ❌ Erreur: $(Split-Path $item.FullName -Leaf) - $_" -ForegroundColor Red
    }
}

Write-Host "`n=== RÉSULTAT ===" -ForegroundColor Cyan
Write-Host "✅ Supprimés: $deleted" -ForegroundColor Green
if ($errors -gt 0) {
    Write-Host "❌ Erreurs: $errors" -ForegroundColor Red
}
Write-Host "📊 Espace libéré: ~$([math]::Round($totalSize, 2)) GB" -ForegroundColor Yellow

Write-Host "`nNote: Les fichiers swap.vhdx seront recrees automatiquement par WSL/Docker si necessaire." -ForegroundColor Cyan
