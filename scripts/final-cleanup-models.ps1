# Script final pour nettoyer les anciens caches de modèles
# Les applications Docker utilisent maintenant ai-models-cache/

$ErrorActionPreference = "Continue"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  NETTOYAGE FINAL DES CACHES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$RootPath = Split-Path -Parent $PSScriptRoot
Set-Location $RootPath

Write-Host "Les applications Docker sont maintenant configurees pour utiliser ai-models-cache/" -ForegroundColor Yellow
Write-Host "Suppression des anciens caches...`n" -ForegroundColor Gray

$pathsToClean = @(
    "$env:USERPROFILE\.cache\torch",
    "$env:USERPROFILE\.cache\huggingface",
    "voice-isolation-service\models-cache"
)

$cleaned = 0
$totalFreed = 0

foreach ($path in $pathsToClean) {
    if (Test-Path $path) {
        Write-Host "Suppression: $path" -ForegroundColor Yellow
        
        # Calculer la taille avant suppression
        $size = (Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue | 
                 Measure-Object -Property Length -Sum -ErrorAction SilentlyContinue).Sum
        if ($size) {
            $sizeGB = [math]::Round($size / 1GB, 2)
            Write-Host "  Taille: $sizeGB GB" -ForegroundColor Gray
            $totalFreed += $size
        }
        
        try {
            # Supprimer récursivement, ignorer les erreurs pour les fichiers verrouillés
            Get-ChildItem -Path $path -Recurse -ErrorAction SilentlyContinue | 
                Remove-Item -Force -Recurse -ErrorAction SilentlyContinue
            
            # Supprimer le dossier s'il est vide
            if (Test-Path $path) {
                Remove-Item -Path $path -Force -ErrorAction SilentlyContinue
            }
            
            Write-Host "  OK - Supprime" -ForegroundColor Green
            $cleaned++
        } catch {
            Write-Host "  ATTENTION - Partiellement supprime (certains fichiers peuvent etre verrouilles)" -ForegroundColor Yellow
            Write-Host "  Les fichiers restants seront ignores" -ForegroundColor Gray
        }
        Write-Host ""
    }
}

# Résumé
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Dossier centralise: ai-models-cache/" -ForegroundColor Green
Write-Host "  - torch/ : Modeles PyTorch (Demucs, etc.)" -ForegroundColor White
Write-Host "  - huggingface/ : Modeles HuggingFace (Hunyuan3D, etc.)" -ForegroundColor White
Write-Host ""

Write-Host "Applications configurees:" -ForegroundColor Green
Write-Host "  - voice-isolation-service -> ai-models-cache/torch" -ForegroundColor White
Write-Host "  - hunyuan3d -> ai-models-cache/huggingface" -ForegroundColor White
Write-Host ""

if ($totalFreed -gt 0) {
    $totalGB = [math]::Round($totalFreed / 1GB, 2)
    Write-Host "Espace libere: $totalGB GB" -ForegroundColor Yellow
}

Write-Host "Caches nettoyes: $cleaned" -ForegroundColor Green
Write-Host ""

Write-Host "Les modeles seront telecharges dans ai-models-cache/ au prochain demarrage" -ForegroundColor Cyan
Write-Host ""
