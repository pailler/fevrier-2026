# Script d'analyse détaillée du stockage Windows - Derniers gros fichiers téléchargés

Write-Host "=== ANALYSE DÉTAILLÉE DU STOCKAGE WINDOWS ===" -ForegroundColor Cyan
Write-Host ""

# 1. Analyse détaillée du dossier Downloads avec tailles
Write-Host "1. Dossier Downloads (fichiers > 10 MB):" -ForegroundColor Yellow
$downloadsPath = "$env:USERPROFILE\Downloads"
if (Test-Path $downloadsPath) {
    $downloads = Get-ChildItem -Path $downloadsPath -File -Recurse -ErrorAction SilentlyContinue | 
        Where-Object {$_.Length -gt 10MB} |
        Sort-Object LastWriteTime -Descending | 
        Select-Object FullName, 
            @{Name='Size(MB)';Expression={[math]::Round($_.Length/1MB,2)}}, 
            @{Name='Size(GB)';Expression={[math]::Round($_.Length/1GB,3)}}, 
            LastWriteTime
    if ($downloads) {
        $downloads | Format-Table FullName, 'Size(MB)', 'Size(GB)', LastWriteTime -AutoSize
        $totalDownloads = ($downloads | Measure-Object -Property 'Size(MB)' -Sum).Sum
        Write-Host "Total Downloads (>10MB): $([math]::Round($totalDownloads,2)) MB ($([math]::Round($totalDownloads/1024,2)) GB)" -ForegroundColor Green
    } else {
        Write-Host "Aucun fichier > 10 MB trouvé dans Downloads" -ForegroundColor Gray
    }
} else {
    Write-Host "Dossier Downloads introuvable" -ForegroundColor Red
}

Write-Host ""

# 2. Analyse des fichiers vidéo récents (souvent les plus gros)
Write-Host "2. Fichiers vidéo récents (7 derniers jours):" -ForegroundColor Yellow
$videoExtensions = @('.mp4', '.avi', '.mkv', '.mov', '.wmv', '.flv', '.webm', '.m4v')
$videoFiles = Get-ChildItem -Path "$env:USERPROFILE\Downloads" -File -Recurse -ErrorAction SilentlyContinue | 
    Where-Object {
        $videoExtensions -contains $_.Extension.ToLower() -and
        $_.LastWriteTime -gt (Get-Date).AddDays(-7)
    } | 
    Sort-Object Length -Descending | 
    Select-Object -First 20 FullName, 
        @{Name='Size(MB)';Expression={[math]::Round($_.Length/1MB,2)}}, 
        @{Name='Size(GB)';Expression={[math]::Round($_.Length/1GB,3)}}, 
        LastWriteTime

if ($videoFiles) {
    $videoFiles | Format-Table FullName, 'Size(MB)', 'Size(GB)', LastWriteTime -AutoSize
    $totalVideo = ($videoFiles | Measure-Object -Property 'Size(MB)' -Sum).Sum
    Write-Host "Total vidéos: $([math]::Round($totalVideo,2)) MB ($([math]::Round($totalVideo/1024,2)) GB)" -ForegroundColor Green
} else {
    Write-Host "Aucun fichier vidéo récent trouvé" -ForegroundColor Gray
}

Write-Host ""

# 3. Top 30 des plus gros fichiers récents (tous types, 7 derniers jours)
Write-Host "3. Top 30 des plus gros fichiers récents (7 derniers jours, > 50 MB):" -ForegroundColor Yellow
$drives = Get-PSDrive -PSProvider FileSystem | Where-Object {$_.Root -ne $null}
$allLargeFiles = @()

foreach ($drive in $drives) {
    $rootPath = $drive.Root
    Write-Host "  Analyse de $rootPath..." -ForegroundColor Gray
    try {
        $files = Get-ChildItem -Path $rootPath -File -Recurse -ErrorAction SilentlyContinue | 
            Where-Object {
                $_.LastWriteTime -gt (Get-Date).AddDays(-7) -and 
                $_.Length -gt 50MB
            } | 
            Select-Object FullName, 
                @{Name='Size(MB)';Expression={[math]::Round($_.Length/1MB,2)}}, 
                @{Name='Size(GB)';Expression={[math]::Round($_.Length/1GB,3)}}, 
                LastWriteTime,
                @{Name='Drive';Expression={$drive.Name}}
        $allLargeFiles += $files
    } catch {
        # Ignorer les erreurs d'accès
    }
}

$topFiles = $allLargeFiles | Sort-Object 'Size(MB)' -Descending | Select-Object -First 30
if ($topFiles) {
    $topFiles | Format-Table FullName, 'Size(MB)', 'Size(GB)', LastWriteTime, Drive -AutoSize
    $totalSize = ($topFiles | Measure-Object -Property 'Size(MB)' -Sum).Sum
    Write-Host "Total des 30 plus gros fichiers: $([math]::Round($totalSize,2)) MB ($([math]::Round($totalSize/1024,2)) GB)" -ForegroundColor Green
} else {
    Write-Host "Aucun gros fichier récent trouvé" -ForegroundColor Gray
}

Write-Host ""

# 4. Analyse spécifique des dossiers de téléchargement courants
Write-Host "4. Analyse des emplacements de téléchargement courants:" -ForegroundColor Yellow
$downloadLocations = @(
    "$env:USERPROFILE\Downloads",
    "$env:USERPROFILE\Documents",
    "$env:USERPROFILE\Desktop",
    "$env:LOCALAPPDATA\Temp",
    "C:\Temp"
)

foreach ($location in $downloadLocations) {
    if (Test-Path $location) {
        Write-Host "  $location :" -ForegroundColor Cyan
        $files = Get-ChildItem -Path $location -File -Recurse -ErrorAction SilentlyContinue | 
            Where-Object {
                $_.LastWriteTime -gt (Get-Date).AddDays(-7) -and 
                $_.Length -gt 100MB
            } | 
            Sort-Object Length -Descending | 
            Select-Object -First 10 FullName, 
                @{Name='Size(MB)';Expression={[math]::Round($_.Length/1MB,2)}}, 
                LastWriteTime
        
        if ($files) {
            $files | Format-Table -AutoSize
            $total = ($files | Measure-Object -Property 'Size(MB)' -Sum).Sum
            Write-Host "    Total: $([math]::Round($total,2)) MB" -ForegroundColor Green
        } else {
            Write-Host "    Aucun gros fichier récent" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# 5. Résumé par type de fichier
Write-Host "5. Résumé par type de fichier (7 derniers jours, > 50 MB):" -ForegroundColor Yellow
$fileTypes = $allLargeFiles | Group-Object {[System.IO.Path]::GetExtension($_.FullName).ToLower()} | 
    Sort-Object Count -Descending | 
    Select-Object Name, 
        @{Name='Count';Expression={$_.Count}}, 
        @{Name='TotalSize(MB)';Expression={[math]::Round(($_.Group | Measure-Object -Property 'Size(MB)' -Sum).Sum,2)}},
        @{Name='TotalSize(GB)';Expression={[math]::Round(($_.Group | Measure-Object -Property 'Size(MB)' -Sum).Sum/1024,2)}}

$fileTypes | Format-Table -AutoSize

Write-Host ""
Write-Host "=== ANALYSE TERMINÉE ===" -ForegroundColor Cyan

