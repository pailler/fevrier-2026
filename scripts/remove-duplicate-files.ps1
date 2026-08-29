# Supprime les doublons de gros fichiers (meme contenu = meme hash)
# Usage : .\scripts\remove-duplicate-files.ps1
# Optionnel : -MinSizeMB 10 (defaut: 5) -DryRun (affiche sans supprimer)

param(
    [int]$MinSizeMB = 5,
    [switch]$DryRun
)

$ErrorActionPreference = "Continue"
$ProjectRoot = $PSScriptRoot | Split-Path -Parent
$ExcludeDirs = @('node_modules', '.venv', '.git')

$minBytes = $MinSizeMB * 1MB
$totalSaved = 0
$filesRemoved = 0

Write-Host "`n=== Recherche de doublons (fichiers > $MinSizeMB MB) ===" -ForegroundColor Cyan

$excludePattern = ($ExcludeDirs | ForEach-Object { [regex]::Escape($_) }) -join '|'
$allFiles = Get-ChildItem -Path $ProjectRoot -Recurse -File -ErrorAction SilentlyContinue |
    Where-Object { $_.Length -ge $minBytes -and $_.FullName -notmatch $excludePattern }

$bySize = $allFiles | Group-Object Length | Where-Object { $_.Count -gt 1 }

foreach ($group in $bySize) {
    $sizeMB = [math]::Round($group.Name / 1MB, 1)
    $hashes = @{}
    foreach ($file in $group.Group) {
        $hash = (Get-FileHash $file.FullName -Algorithm SHA256 -ErrorAction SilentlyContinue).Hash
        if (-not $hashes[$hash]) { $hashes[$hash] = @() }
        $hashes[$hash] += $file
    }
    foreach ($hash in $hashes.Keys) {
        $dupList = $hashes[$hash]
        if ($dupList.Count -gt 1) {
            $keep = $dupList[0]
            $toRemove = $dupList[1..($dupList.Count - 1)]
            $saved = ($toRemove.Count * $group.Name)
            $totalSaved += $saved
            Write-Host "`n$($dupList.Count) fichiers identiques ($sizeMB MB) - hash $($hash.Substring(0,12))..." -ForegroundColor Yellow
            Write-Host "  Garde   : $($keep.FullName.Replace($ProjectRoot,''))" -ForegroundColor Green
            foreach ($f in $toRemove) {
                Write-Host "  Supprime: $($f.FullName.Replace($ProjectRoot,''))" -ForegroundColor Red
                if (-not $DryRun) {
                    Remove-Item $f.FullName -Force -ErrorAction SilentlyContinue
                    $filesRemoved++
                }
            }
        }
    }
}

Write-Host "`n=== Termine ===" -ForegroundColor Cyan
Write-Host "  Fichiers supprimes: $filesRemoved" -ForegroundColor White
Write-Host "  Espace libere: $([math]::Round($totalSaved/1MB, 1)) MB" -ForegroundColor White
if ($DryRun) { Write-Host "  (Mode -DryRun : rien n'a ete supprime)" -ForegroundColor Gray }
Write-Host ""
