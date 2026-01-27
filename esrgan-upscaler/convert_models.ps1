# Script PowerShell pour convertir les modèles Real-ESRGAN
# Convertit automatiquement tous les modèles dans le dossier ESRGAN

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion des modeles Real-ESRGAN" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$modelsDir = "C:\Users\AAA\Documents\StabilityMatrix-win-x64\Data\Models\ESRGAN"
$outputDir = "C:\Users\AAA\Documents\iahome\esrgan-upscaler\converted_models"

# Créer le dossier de sortie
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir | Out-Null
    Write-Host "Dossier cree: $outputDir" -ForegroundColor Green
}

# Trouver tous les fichiers .pt
$modelFiles = Get-ChildItem -Path $modelsDir -Filter "*.pt"

if ($modelFiles.Count -eq 0) {
    Write-Host "Aucun fichier .pt trouve dans $modelsDir" -ForegroundColor Yellow
    exit
}

Write-Host "Modeles trouves: $($modelFiles.Count)" -ForegroundColor Green
Write-Host ""

foreach ($modelFile in $modelFiles) {
    Write-Host "Traitement: $($modelFile.Name)" -ForegroundColor Yellow
    
    $outputFile = Join-Path $outputDir "$($modelFile.BaseName)_converted.pt"
    
    Write-Host "  Conversion en cours..." -ForegroundColor Cyan
    python convert_model.py $modelFile.FullName $outputFile
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Converti avec succes: $outputFile" -ForegroundColor Green
    } else {
        Write-Host "  ✗ Erreur lors de la conversion" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Conversion terminee!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Modeles convertis dans: $outputDir" -ForegroundColor Green
