# Script pour vérifier les gros fichiers dans les dossiers temporaires Windows

Write-Host "`n=== VÉRIFICATION DES FICHIERS TEMPORAIRES WINDOWS ===" -ForegroundColor Cyan

# Dossiers temporaires à vérifier
$tempDirs = @(
    $env:TEMP,
    $env:TMP,
    "C:\Windows\Temp",
    "$env:USERPROFILE\AppData\Local\Temp"
)

$totalSize = 0
$largeFilesFound = @()

# 1. Vérifier la taille totale de chaque dossier temp
Write-Host "`n=== TAILLE TOTALE DES DOSSIERS TEMP ===" -ForegroundColor Cyan
foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        $size = (Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
        Write-Host "`n📁 $dir" -ForegroundColor Yellow
        Write-Host "  Taille totale: $([math]::Round($size, 2)) GB" -ForegroundColor $(if ($size -gt 5) { "Red" } elseif ($size -gt 1) { "Yellow" } else { "Green" })
    }
}

# 2. Rechercher les fichiers > 1 GB
Write-Host "`n=== FICHIERS > 1 GB DANS TEMP ===" -ForegroundColor Cyan
foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        $largeFiles = Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Length -gt 1GB } |
            Sort-Object Length -Descending
        
        if ($largeFiles.Count -gt 0) {
            Write-Host "`n📁 $dir" -ForegroundColor Yellow
            foreach ($file in $largeFiles) {
                $size = $file.Length / 1GB
                $totalSize += $size
                $relativePath = $file.FullName.Replace($dir + "\", "")
                $age = (Get-Date) - $file.LastWriteTime
                
                Write-Host "  ⚠️  $relativePath" -ForegroundColor Red
                Write-Host "     Taille: $([math]::Round($size, 2)) GB" -ForegroundColor White
                Write-Host "     Modifié: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm')) ($($age.Days) jours)" -ForegroundColor Gray
                Write-Host "     Créé: $($file.CreationTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
                
                $largeFilesFound += [PSCustomObject]@{
                    Path = $file.FullName
                    SizeGB = $size
                    LastModified = $file.LastWriteTime
                    Age = $age.Days
                }
            }
        }
    }
}

# 3. Rechercher les fichiers récents > 100 MB
Write-Host "`n=== FICHIERS RÉCENTS > 100 MB (30 derniers jours) ===" -ForegroundColor Cyan
$recentLargeFiles = @()
foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        $files = Get-ChildItem $dir -Recurse -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Length -gt 100MB -and $_.LastWriteTime -gt (Get-Date).AddDays(-30) } |
            Sort-Object Length -Descending |
            Select-Object -First 20
        
        if ($files.Count -gt 0) {
            Write-Host "`n📁 $dir" -ForegroundColor Yellow
            foreach ($file in $files) {
                $size = $file.Length / 1GB
                $relativePath = $file.FullName.Replace($dir + "\", "")
                
                Write-Host "  ⚠️  $relativePath" -ForegroundColor $(if ($size -gt 1) { "Red" } else { "Yellow" })
                Write-Host "     Taille: $([math]::Round($size, 2)) GB | Modifié: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
                
                $recentLargeFiles += [PSCustomObject]@{
                    Path = $file.FullName
                    SizeGB = $size
                    LastModified = $file.LastWriteTime
                }
            }
        }
    }
}

# 4. Rechercher les dossiers volumineux
Write-Host "`n=== DOSSIERS VOLUMINEUX DANS TEMP ===" -ForegroundColor Cyan
foreach ($dir in $tempDirs) {
    if (Test-Path $dir) {
        $largeDirs = Get-ChildItem $dir -Directory -ErrorAction SilentlyContinue | 
            ForEach-Object {
                $size = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object -Property Length -Sum).Sum / 1GB
                if ($size -gt 0.1) {
                    [PSCustomObject]@{
                        Name = $_.Name
                        SizeGB = $size
                        Path = $_.FullName
                        LastModified = (Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Sort-Object LastWriteTime -Descending | Select-Object -First 1).LastWriteTime
                    }
                }
            } | 
            Sort-Object SizeGB -Descending | 
            Select-Object -First 10
        
        if ($largeDirs.Count -gt 0) {
            Write-Host "`n📁 $dir" -ForegroundColor Yellow
            foreach ($d in $largeDirs) {
                $age = (Get-Date) - $d.LastModified
                Write-Host "  ⚠️  $($d.Name): $([math]::Round($d.SizeGB, 2)) GB" -ForegroundColor $(if ($d.SizeGB -gt 1) { "Red" } else { "Yellow" })
                Write-Host "     Chemin: $($d.Path)" -ForegroundColor Gray
                Write-Host "     Dernière modif: $($d.LastModified.ToString('yyyy-MM-dd HH:mm')) ($($age.Days) jours)" -ForegroundColor Gray
            }
        }
    }
}

# 5. Vérifier les téléchargements
Write-Host "`n=== TÉLÉCHARGEMENTS RÉCENTS (> 1 GB) ===" -ForegroundColor Cyan
$downloadDirs = @(
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Desktop"
)

foreach ($dir in $downloadDirs) {
    if (Test-Path $dir) {
        $largeFiles = Get-ChildItem $dir -File -ErrorAction SilentlyContinue | 
            Where-Object { $_.Length -gt 1GB -and $_.LastWriteTime -gt (Get-Date).AddDays(-30) } |
            Sort-Object Length -Descending |
            Select-Object -First 10
        
        if ($largeFiles.Count -gt 0) {
            Write-Host "`n📁 $dir" -ForegroundColor Yellow
            foreach ($file in $largeFiles) {
                Write-Host "  ⚠️  $($file.Name)" -ForegroundColor Red
                Write-Host "     Taille: $([math]::Round($file.Length / 1GB, 2)) GB | Modifié: $($file.LastWriteTime.ToString('yyyy-MM-dd HH:mm'))" -ForegroundColor Gray
            }
        }
    }
}

# Résumé
Write-Host "`n=== RÉSUMÉ ===" -ForegroundColor Cyan
if ($largeFilesFound.Count -gt 0) {
    $totalSize = ($largeFilesFound | Measure-Object -Property SizeGB -Sum).Sum
    Write-Host "⚠️  Fichiers > 1 GB trouvés: $($largeFilesFound.Count)" -ForegroundColor Red
    Write-Host "📊 Taille totale: $([math]::Round($totalSize, 2)) GB" -ForegroundColor Yellow
    
    Write-Host "`n💡 Recommandations:" -ForegroundColor Cyan
    Write-Host "  - Les fichiers temp peuvent généralement être supprimés en toute sécurité" -ForegroundColor White
    Write-Host "  - Utilisez le nettoyage de disque Windows ou supprimez manuellement" -ForegroundColor White
    Write-Host "  - Vérifiez les fichiers récents avant suppression" -ForegroundColor White
} else {
    Write-Host "✅ Aucun fichier > 1 GB trouvé dans les dossiers temp" -ForegroundColor Green
}

if ($recentLargeFiles.Count -gt 0) {
    Write-Host "`n⚠️  Fichiers récents > 100 MB: $($recentLargeFiles.Count)" -ForegroundColor Yellow
    $recentTotal = ($recentLargeFiles | Measure-Object -Property SizeGB -Sum).Sum
    Write-Host "📊 Taille totale récente: $([math]::Round($recentTotal, 2)) GB" -ForegroundColor Yellow
}
