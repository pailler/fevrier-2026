# Script de démarrage amélioré pour Blender 3D v2.0
# Démarre tous les services Docker avec les nouvelles fonctionnalités

Write-Host "🚀 Démarrage de Blender 3D v2.0 - Services Virtualisés" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan

# Vérifier si Docker est en cours d'exécution
Write-Host "🔍 Vérification de Docker..." -ForegroundColor Yellow
try {
    docker version | Out-Null
    Write-Host "✅ Docker est en cours d'exécution" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas en cours d'exécution. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Arrêter les services existants s'ils sont en cours d'exécution
Write-Host "🛑 Arrêt des services existants..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.blender.yml down
    Write-Host "✅ Services arrêtés" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun service en cours d'exécution" -ForegroundColor Blue
}

# Nettoyer les conteneurs orphelins
Write-Host "🧹 Nettoyage des conteneurs orphelins..." -ForegroundColor Yellow
try {
    docker container prune -f
    Write-Host "✅ Nettoyage terminé" -ForegroundColor Green
} catch {
    Write-Host "ℹ️ Aucun conteneur orphelin trouvé" -ForegroundColor Blue
}

# Créer les dossiers nécessaires
Write-Host "📁 Création des dossiers..." -ForegroundColor Yellow
$folders = @("blender-output", "blender-temp", "blender-api/temp", "blender-api/output")
foreach ($folder in $folders) {
    if (!(Test-Path $folder)) {
        New-Item -ItemType Directory -Path $folder -Force | Out-Null
        Write-Host "✅ Dossier créé: $folder" -ForegroundColor Green
    } else {
        Write-Host "ℹ️ Dossier existant: $folder" -ForegroundColor Blue
    }
}

# Copier la nouvelle API améliorée si elle existe
if (Test-Path "blender-api/api_server_enhanced.py") {
    Write-Host "📋 Copie de l'API améliorée..." -ForegroundColor Yellow
    Copy-Item "blender-api/api_server_enhanced.py" "blender-api/api_server.py" -Force
    Write-Host "✅ API améliorée copiée" -ForegroundColor Green
}

# Démarrer les services
Write-Host "🚀 Démarrage des services Blender 3D v2.0..." -ForegroundColor Yellow
try {
    docker-compose -f docker-compose.blender.yml up -d
    Write-Host "✅ Services démarrés avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage des services" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}

# Attendre que les services soient prêts
Write-Host "⏳ Attente du démarrage des services..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# Vérifier le statut des services
Write-Host "🔍 Vérification du statut des services..." -ForegroundColor Yellow
try {
    $status = docker-compose -f docker-compose.blender.yml ps
    Write-Host $status -ForegroundColor Cyan
} catch {
    Write-Host "❌ Erreur lors de la vérification du statut" -ForegroundColor Red
}

# Tester l'API
Write-Host "🧪 Test de l'API Blender..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/health" -Method GET -TimeoutSec 10
    Write-Host "✅ API Blender accessible: $($response.status)" -ForegroundColor Green
    Write-Host "   Version: $($response.version)" -ForegroundColor Cyan
} catch {
    Write-Host "❌ API Blender non accessible: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   L'API peut prendre quelques minutes à démarrer..." -ForegroundColor Yellow
}

# Afficher les informations de connexion
Write-Host ""
Write-Host "🎉 Blender 3D v2.0 est maintenant opérationnel !" -ForegroundColor Green
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "📊 Services disponibles:" -ForegroundColor White
Write-Host "   🌐 Interface Web Blender: http://localhost:9091" -ForegroundColor Cyan
Write-Host "   🔧 API Flask Blender: http://localhost:3001" -ForegroundColor Cyan
Write-Host "   🎨 Next.js App: http://localhost:3000/blender-3d" -ForegroundColor Cyan
Write-Host ""
Write-Host "🧪 Tests disponibles:" -ForegroundColor White
Write-Host "   📋 Test complet: python test-blender-enhanced.py" -ForegroundColor Cyan
Write-Host "   🔍 Test simple: python test-blender-api.py" -ForegroundColor Cyan
Write-Host ""
Write-Host "🎯 Nouvelles fonctionnalités v2.0:" -ForegroundColor White
Write-Host "   🎨 Matériaux: métal, verre, bois, plastique, caoutchouc, etc." -ForegroundColor Green
Write-Host "   🎨 Couleurs: rouge, bleu, vert, jaune, orange, violet, etc." -ForegroundColor Green
Write-Host "   🏛️ Formes avancées: pyramide, icosphère, monkey Suzanne" -ForegroundColor Green
Write-Host "   🎬 Animations: rotation, redimensionnement, rebond" -ForegroundColor Green
Write-Host "   📦 Export: OBJ, STL, FBX, GLTF, DAE, BLEND" -ForegroundColor Green
Write-Host "   🎭 Scènes complexes avec plusieurs objets" -ForegroundColor Green
Write-Host "   💡 Système d'aide intégré" -ForegroundColor Green
Write-Host ""
Write-Host "💡 Exemples d'utilisation:" -ForegroundColor White
Write-Host "   • 'crée un cube rouge métallique de 2cm'" -ForegroundColor Yellow
Write-Host "   • 'une sphère bleue en verre'" -ForegroundColor Yellow
Write-Host "   • 'pyramide dorée en céramique'" -ForegroundColor Yellow
Write-Host "   • 'cube qui tourne'" -ForegroundColor Yellow
Write-Host "   • 'exporter en STL'" -ForegroundColor Yellow
Write-Host "   • 'aide'" -ForegroundColor Yellow
Write-Host ""
Write-Host "🛑 Pour arrêter: .\stop-blender.ps1" -ForegroundColor Red
Write-Host "📊 Pour voir les logs: docker-compose -f docker-compose.blender.yml logs -f" -ForegroundColor Blue
Write-Host ("=" * 60) -ForegroundColor Cyan

