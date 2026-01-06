# Script PowerShell pour télécharger automatiquement les fichiers audio des nouveaux animaux
# Utilise des sources libres de droits (Freesound, Pixabay direct links, etc.)

$ErrorActionPreference = "Continue"
$soundsDir = Join-Path $PSScriptRoot "..\public\sounds"
if (-not (Test-Path $soundsDir)) {
    New-Item -ItemType Directory -Path $soundsDir -Force | Out-Null
}

Write-Host "📥 Téléchargement automatique des fichiers audio des nouveaux animaux..." -ForegroundColor Cyan
Write-Host ""

# URLs directes de fichiers audio libres de droits depuis Pixabay CDN
# Ces URLs sont des exemples - vous devrez peut-être les mettre à jour avec de vraies URLs Pixabay
$animals = @{
    "chevre" = @{
        "urls" = @(
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12345_goat.mp3",
            "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/goat_bleat.mp3"
        )
        "search" = "goat"
    }
    "souris" = @{
        "urls" = @(
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12345_mouse.mp3",
            "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/mouse_squeak.mp3"
        )
        "search" = "mouse"
    }
    "poule" = @{
        "urls" = @(
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12345_chicken.mp3",
            "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/chicken_cluck.mp3"
        )
        "search" = "chicken"
    }
    "lapin" = @{
        "urls" = @(
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12345_rabbit.mp3",
            "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/rabbit_squeak.mp3"
        )
        "search" = "rabbit"
    }
    "ane" = @{
        "urls" = @(
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12345_donkey.mp3",
            "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/donkey_bray.mp3"
        )
        "search" = "donkey"
    }
    "dinde" = @{
        "urls" = @(
            "https://cdn.pixabay.com/download/audio/2022/03/15/audio_12345_turkey.mp3",
            "https://www.zapsplat.com/wp-content/uploads/2015/sound-effects-one/turkey_gobble.mp3"
        )
        "search" = "turkey"
    }
}

$downloaded = 0
$failed = 0

foreach ($animal in $animals.Keys) {
    $fileName = "$animal.wav"
    $filePath = Join-Path $soundsDir $fileName
    
    # Vérifier si le fichier existe déjà
    if (Test-Path $filePath) {
        Write-Host "✅ $fileName existe déjà, ignoré" -ForegroundColor Green
        continue
    }
    
    Write-Host "📥 Téléchargement de $fileName..." -ForegroundColor Cyan
    
    $success = $false
    $urls = $animals[$animal]["urls"]
    
    foreach ($url in $urls) {
        try {
            Write-Host "   Tentative avec: $url" -ForegroundColor Gray
            $response = Invoke-WebRequest -Uri $url -OutFile $filePath -ErrorAction Stop -TimeoutSec 30
            
            # Vérifier que le fichier n'est pas vide
            if ((Get-Item $filePath).Length -gt 0) {
                Write-Host "✅ $fileName téléchargé avec succès" -ForegroundColor Green
                $downloaded++
                $success = $true
                break
            } else {
                Remove-Item $filePath -Force
            }
        }
        catch {
            Write-Host "   Échec: $($_.Exception.Message)" -ForegroundColor Gray
            if (Test-Path $filePath) {
                Remove-Item $filePath -Force
            }
        }
    }
    
    if (-not $success) {
        Write-Host "❌ Impossible de télécharger $fileName depuis les URLs automatiques" -ForegroundColor Red
        Write-Host "   💡 Téléchargez manuellement depuis: https://pixabay.com/fr/sound-effects/search/$($animals[$animal]['search'])/" -ForegroundColor Yellow
        $failed++
    }
}

Write-Host ""
Write-Host "📊 Résumé:" -ForegroundColor Cyan
Write-Host "   ✅ Téléchargés: $downloaded" -ForegroundColor Green
Write-Host "   ❌ Échecs: $failed" -ForegroundColor $(if ($failed -gt 0) { "Red" } else { "Green" })

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "💡 Si certains fichiers n'ont pas pu être téléchargés:" -ForegroundColor Yellow
    Write-Host "   1. Visitez https://pixabay.com/fr/sound-effects/" -ForegroundColor White
    Write-Host "   2. Recherchez chaque animal manuellement" -ForegroundColor White
    Write-Host "   3. Téléchargez et placez dans: $soundsDir" -ForegroundColor White
}

Write-Host ""
Write-Host "🔄 Redémarrez le container Docker pour que les fichiers soient pris en compte:" -ForegroundColor Cyan
Write-Host "   cd apprendre-autrement" -ForegroundColor White
Write-Host "   docker-compose restart" -ForegroundColor White
