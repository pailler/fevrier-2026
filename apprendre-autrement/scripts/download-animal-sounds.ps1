# Script PowerShell pour télécharger les fichiers audio des nouveaux animaux
# Depuis Pixabay (gratuit et libre de droits)

$soundsDir = Join-Path $PSScriptRoot "..\public\sounds"
if (-not (Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir -Force | Out-Null
}

Write-Host "📥 Téléchargement des fichiers audio des nouveaux animaux..." -ForegroundColor Cyan
Write-Host ""

# URLs Pixabay pour chaque animal (à remplacer par les URLs réelles)
$animals = @{
    "chevre" = "https://cdn.pixabay.com/download/audio/2021/10/25/audio_abc123_goat.mp3"
    "souris" = "https://cdn.pixabay.com/download/audio/2021/10/25/audio_abc123_mouse.mp3"
    "poule" = "https://cdn.pixabay.com/download/audio/2021/10/25/audio_abc123_chicken.mp3"
    "lapin" = "https://cdn.pixabay.com/download/audio/2021/10/25/audio_abc123_rabbit.mp3"
    "ane" = "https://cdn.pixabay.com/download/audio/2021/10/25/audio_abc123_donkey.mp3"
    "dinde" = "https://cdn.pixabay.com/download/audio/2021/10/25/audio_abc123_turkey.mp3"
}

Write-Host "⚠️  Ce script nécessite des URLs directes depuis Pixabay." -ForegroundColor Yellow
Write-Host "`n📋 Instructions manuelles:" -ForegroundColor Cyan
Write-Host "   1. Visitez https://pixabay.com/fr/sound-effects/" -ForegroundColor White
Write-Host "   2. Recherchez chaque animal:" -ForegroundColor White
Write-Host "      - 'goat' pour chèvre" -ForegroundColor Gray
Write-Host "      - 'mouse' pour souris" -ForegroundColor Gray
Write-Host "      - 'chicken' pour poule" -ForegroundColor Gray
Write-Host "      - 'rabbit' pour lapin" -ForegroundColor Gray
Write-Host "      - 'donkey' pour âne" -ForegroundColor Gray
Write-Host "      - 'turkey' pour dinde" -ForegroundColor Gray
Write-Host "   3. Cliquez sur 'Télécharger' pour chaque son" -ForegroundColor White
Write-Host "   4. Renommez les fichiers et placez-les dans: $soundsDir" -ForegroundColor White
Write-Host "`n📁 Fichiers attendus:" -ForegroundColor Cyan
Write-Host "   - chevre.wav (ou .mp3)" -ForegroundColor White
Write-Host "   - souris.wav (ou .mp3)" -ForegroundColor White
Write-Host "   - poule.wav (ou .mp3)" -ForegroundColor White
Write-Host "   - lapin.wav (ou .mp3)" -ForegroundColor White
Write-Host "   - ane.wav (ou .mp3)" -ForegroundColor White
Write-Host "   - dinde.wav (ou .mp3)" -ForegroundColor White
