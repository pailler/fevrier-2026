# Script PowerShell pour télécharger les bruits de la ville
# Les fichiers seront téléchargés depuis des sources libres de droits

$soundsDir = Join-Path $PSScriptRoot "."
Write-Host "📁 Dossier de destination: $soundsDir" -ForegroundColor Cyan

# Liste des fichiers à télécharger avec leurs URLs (exemples - à remplacer par de vraies URLs)
$sounds = @{
    "fire-truck.mp3" = "https://example.com/fire-truck.mp3"  # À remplacer
    "garbage-truck.mp3" = "https://example.com/garbage-truck.mp3"  # À remplacer
    "police-siren.mp3" = "https://example.com/police-siren.mp3"  # À remplacer
    "ambulance.mp3" = "https://example.com/ambulance.mp3"  # À remplacer
    "motorcycle.mp3" = "https://example.com/motorcycle.mp3"  # À remplacer
    "car.mp3" = "https://example.com/car.mp3"  # À remplacer
}

Write-Host "`n⚠️  IMPORTANT: Ce script nécessite des URLs valides pour télécharger les fichiers audio" -ForegroundColor Yellow
Write-Host "`n📋 Sources recommandées:" -ForegroundColor Cyan
Write-Host "   1. Freesound.org (https://freesound.org/)" -ForegroundColor White
Write-Host "      - Rechercher: 'fire truck sound', 'garbage truck', 'police siren', etc." -ForegroundColor Gray
Write-Host "      - Filtrer par licence CC0 ou CC BY" -ForegroundColor Gray
Write-Host "   2. Zapsplat (https://www.zapsplat.com/)" -ForegroundColor White
Write-Host "      - Compte gratuit requis" -ForegroundColor Gray
Write-Host "   3. YouTube Audio Library" -ForegroundColor White
Write-Host "      - Bibliothèque audio gratuite" -ForegroundColor Gray
Write-Host "`n💡 Instructions:" -ForegroundColor Yellow
Write-Host "   1. Téléchargez les fichiers audio depuis une source libre de droits" -ForegroundColor White
Write-Host "   2. Renommez-les exactement comme indiqué ci-dessus" -ForegroundColor White
Write-Host "   3. Placez-les dans le dossier: $soundsDir" -ForegroundColor White
Write-Host "   4. L'activité fonctionnera automatiquement avec ces fichiers" -ForegroundColor White
Write-Host "`n✅ Si les fichiers ne sont pas disponibles, l'application utilisera la synthèse vocale" -ForegroundColor Green

# Fonction pour télécharger un fichier (exemple - nécessite des URLs valides)
function Download-Sound {
    param(
        [string]$FileName,
        [string]$Url
    )
    
    $filePath = Join-Path $soundsDir $FileName
    
    if (Test-Path $filePath) {
        Write-Host "✅ $FileName existe déjà" -ForegroundColor Green
        return
    }
    
    if ($Url -eq "https://example.com/$FileName") {
        Write-Host "⚠️  $FileName : URL non configurée (à télécharger manuellement)" -ForegroundColor Yellow
        return
    }
    
    try {
        Write-Host "📥 Téléchargement de $FileName..." -ForegroundColor Cyan
        Invoke-WebRequest -Uri $Url -OutFile $filePath -UseBasicParsing
        Write-Host "✅ $FileName téléchargé avec succès" -ForegroundColor Green
    } catch {
        Write-Host "❌ Erreur lors du téléchargement de $FileName : $_" -ForegroundColor Red
    }
}

# Télécharger chaque fichier
Write-Host "`n📥 Téléchargement des fichiers audio..." -ForegroundColor Cyan
foreach ($sound in $sounds.GetEnumerator()) {
    Download-Sound -FileName $sound.Key -Url $sound.Value
}

Write-Host "`n✅ Script terminé !" -ForegroundColor Green
Write-Host "`n🌐 Testez l'activité sur: http://localhost:9001/apprendre-autrement/activity/city-sounds" -ForegroundColor Yellow
