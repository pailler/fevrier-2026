# Script d'extraction de Hunyuan3D-2-WinPortable
# Nécessite 7-Zip installé

Write-Host "🔧 Extraction de Hunyuan3D-2-WinPortable..." -ForegroundColor Cyan

# Vérifier si 7-Zip est installé
$7zipPaths = @(
    "C:\Program Files\7-Zip\7z.exe",
    "C:\Program Files (x86)\7-Zip\7z.exe"
)

$7zipPath = $null
foreach ($path in $7zipPaths) {
    if (Test-Path $path) {
        $7zipPath = $path
        break
    }
}

if (-not $7zipPath) {
    Write-Host "❌ 7-Zip n'est pas installé!" -ForegroundColor Red
    Write-Host ""
    Write-Host "📥 Téléchargez et installez 7-Zip depuis:" -ForegroundColor Yellow
    Write-Host "   https://www.7-zip.org/" -ForegroundColor White
    Write-Host ""
    Write-Host "💡 Alternative: Utilisez l'interface graphique:" -ForegroundColor Cyan
    Write-Host "   1. Clic droit sur 'Hunyuan3D2_WinPortable_cu129.7z.001'" -ForegroundColor White
    Write-Host "   2. Sélectionnez '7-Zip' > 'Extraire ici'" -ForegroundColor White
    Write-Host ""
    exit 1
}

# Vérifier que les fichiers existent
$part1 = "Hunyuan3D2_WinPortable_cu129.7z.001"
$part2 = "Hunyuan3D2_WinPortable_cu129.7z.002"

if (-not (Test-Path $part1)) {
    Write-Host "❌ Fichier $part1 non trouvé!" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $part2)) {
    Write-Host "❌ Fichier $part2 non trouvé!" -ForegroundColor Red
    exit 1
}

# Dossier de destination
$extractTo = "Hunyuan3D2_WinPortable_cu129"

Write-Host "✅ 7-Zip trouvé: $7zipPath" -ForegroundColor Green
Write-Host "📦 Extraction vers: $extractTo" -ForegroundColor Cyan
Write-Host ""

# Extraire l'archive (7z gère automatiquement les volumes multiples)
try {
    & $7zipPath x $part1 "-o$extractTo" -y | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Extraction réussie!" -ForegroundColor Green
        Write-Host ""
        Write-Host "📁 Contenu extrait dans: $extractTo" -ForegroundColor Cyan
        
        # Vérifier la structure
        if (Test-Path "$extractTo\Hunyuan3D2_WinPortable") {
            Write-Host "✅ Structure de dossiers correcte" -ForegroundColor Green
        }
    } else {
        Write-Host "❌ Erreur lors de l'extraction (code: $LASTEXITCODE)" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "🎉 Installation terminée!" -ForegroundColor Green


