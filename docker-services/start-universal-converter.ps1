# Script de démarrage pour le Convertisseur Universel v1
# IAHome - Convertisseur Universel

Write-Host "🚀 Démarrage du Convertisseur Universel v1 - IAHome..." -ForegroundColor Green

# Vérifier si Docker est en cours d'exécution
try {
    docker version | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Vérifier que les dossiers existent
Write-Host "📁 Vérification des dossiers..." -ForegroundColor Yellow

$folders = @(
    "universal-converter",
    "universal-converter\uploads",
    "universal-converter\downloads",
    "universal-converter\templates"
)

foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "  ✅ Créé: $folder" -ForegroundColor Green
    } else {
        Write-Host "  📁 Existe déjà: $folder" -ForegroundColor Blue
    }
}

# Construire et démarrer le service
Write-Host "🐳 Construction et démarrage du Convertisseur Universel..." -ForegroundColor Yellow

# Construire l'image Docker
Write-Host "  🔨 Construction de l'image Docker..." -ForegroundColor Cyan
docker-compose -f docker-compose.universal-converter.yml build

# Démarrer le service
Write-Host "  🚀 Démarrage du service..." -ForegroundColor Cyan
docker-compose -f docker-compose.universal-converter.yml up -d

# Attendre que le service soit prêt
Write-Host "⏳ Attente du démarrage du service..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut du service
Write-Host "🔍 Vérification du statut du service..." -ForegroundColor Yellow

$status = docker-compose -f docker-compose.universal-converter.yml ps universal-converter --format "table {{.Service}}\t{{.Status}}"
Write-Host "  $status" -ForegroundColor Blue

# Afficher les URLs d'accès
Write-Host "`n🌐 Convertisseur Universel v1 disponible :" -ForegroundColor Green
Write-Host "  🔗 Interface Web :" -ForegroundColor Cyan
Write-Host "     - Local: http://localhost:8096" -ForegroundColor White
Write-Host "     - Domaine: https://converter.iahome.fr" -ForegroundColor White
Write-Host "     - Formats: Images, Documents, Audio, Vidéo" -ForegroundColor Gray

Write-Host "`n🎯 Fonctionnalités :" -ForegroundColor Yellow
Write-Host "  📸 Images: PNG, JPG, GIF, WEBP, SVG, TIFF, BMP" -ForegroundColor Gray
Write-Host "  📄 Documents: PDF, DOCX, ODT, RTF, TXT, HTML, MD" -ForegroundColor Gray
Write-Host "  🎵 Audio: MP3, WAV, FLAC, AAC, OGG, M4A" -ForegroundColor Gray
Write-Host "  🎬 Vidéo: MP4, AVI, MOV, MKV, WMV, FLV, WEBM" -ForegroundColor Gray

Write-Host "`n📋 Commandes utiles :" -ForegroundColor Yellow
Write-Host "  - Voir les logs: docker-compose -f docker-compose.universal-converter.yml logs -f" -ForegroundColor Gray
Write-Host "  - Arrêter: docker-compose -f docker-compose.universal-converter.yml down" -ForegroundColor Gray
Write-Host "  - Redémarrer: docker-compose -f docker-compose.universal-converter.yml restart" -ForegroundColor Gray
Write-Host "  - Reconstruire: docker-compose -f docker-compose.universal-converter.yml build --no-cache" -ForegroundColor Gray

Write-Host "`n✅ Convertisseur Universel v1 démarré avec succès !" -ForegroundColor Green
Write-Host "🎯 Accédez à l'interface web pour commencer à convertir vos fichiers." -ForegroundColor Magenta
