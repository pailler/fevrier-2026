# Script pour nettoyer les containers QR codes dans Docker
# À exécuter une fois que Docker Desktop est complètement démarré

Write-Host "🧹 Nettoyage des containers QR codes dans Docker..." -ForegroundColor Cyan

# Vérifier que Docker est accessible
try {
    docker version | Out-Null
    Write-Host "✅ Docker est accessible" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas accessible. Veuillez attendre que Docker Desktop soit complètement démarré." -ForegroundColor Red
    exit 1
}

# Lister tous les containers qrcodes
Write-Host "🔍 Recherche des containers QR codes..." -ForegroundColor Yellow
$containers = docker ps -a --format "table {{.Names}}\t{{.Image}}\t{{.Status}}" | Select-String "qrcode"

if ($containers) {
    Write-Host "📋 Containers QR codes trouvés:" -ForegroundColor Cyan
    $containers | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    # Arrêter et supprimer tous les containers qrcodes
    Write-Host "⏹️ Arrêt et suppression des containers QR codes..." -ForegroundColor Yellow
    
    # Extraire les noms des containers
    $containerNames = $containers | ForEach-Object { 
        ($_ -split '\s+')[0] 
    } | Where-Object { $_ -ne "NAMES" -and $_ -ne "" }
    
    foreach ($containerName in $containerNames) {
        try {
            Write-Host "   Arrêt de $containerName..." -ForegroundColor Gray
            docker stop $containerName 2>$null
            
            Write-Host "   Suppression de $containerName..." -ForegroundColor Gray
            docker rm $containerName 2>$null
            
            Write-Host "   ✅ $containerName supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ Erreur avec $containerName : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Aucun container QR codes trouvé" -ForegroundColor Green
}

# Lister les images qrcodes
Write-Host "🔍 Recherche des images QR codes..." -ForegroundColor Yellow
$images = docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" | Select-String "qrcode"

if ($images) {
    Write-Host "📋 Images QR codes trouvées:" -ForegroundColor Cyan
    $images | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    Write-Host "🗑️ Suppression des images QR codes..." -ForegroundColor Yellow
    
    # Extraire les noms des images
    $imageNames = $images | ForEach-Object { 
        $parts = $_ -split '\s+'
        if ($parts.Length -ge 2) {
            "$($parts[0]):$($parts[1])"
        }
    } | Where-Object { $_ -ne "REPOSITORY:TAG" -and $_ -ne "" }
    
    foreach ($imageName in $imageNames) {
        try {
            Write-Host "   Suppression de $imageName..." -ForegroundColor Gray
            docker rmi $imageName 2>$null
            Write-Host "   ✅ $imageName supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ Erreur avec $imageName : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Aucune image QR codes trouvée" -ForegroundColor Green
}

# Lister les volumes qrcodes
Write-Host "🔍 Recherche des volumes QR codes..." -ForegroundColor Yellow
$volumes = docker volume ls --format "table {{.Name}}\t{{.Driver}}" | Select-String "qrcode"

if ($volumes) {
    Write-Host "📋 Volumes QR codes trouvés:" -ForegroundColor Cyan
    $volumes | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    Write-Host "🗑️ Suppression des volumes QR codes..." -ForegroundColor Yellow
    
    # Extraire les noms des volumes
    $volumeNames = $volumes | ForEach-Object { 
        ($_ -split '\s+')[0] 
    } | Where-Object { $_ -ne "NAME" -and $_ -ne "" }
    
    foreach ($volumeName in $volumeNames) {
        try {
            Write-Host "   Suppression de $volumeName..." -ForegroundColor Gray
            docker volume rm $volumeName 2>$null
            Write-Host "   ✅ $volumeName supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ Erreur avec $volumeName : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Aucun volume QR codes trouvé" -ForegroundColor Green
}

# Lister les réseaux qrcodes
Write-Host "🔍 Recherche des réseaux QR codes..." -ForegroundColor Yellow
$networks = docker network ls --format "table {{.Name}}\t{{.Driver}}" | Select-String "qrcode"

if ($networks) {
    Write-Host "📋 Réseaux QR codes trouvés:" -ForegroundColor Cyan
    $networks | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
    
    Write-Host "🗑️ Suppression des réseaux QR codes..." -ForegroundColor Yellow
    
    # Extraire les noms des réseaux
    $networkNames = $networks | ForEach-Object { 
        ($_ -split '\s+')[0] 
    } | Where-Object { $_ -ne "NAME" -and $_ -ne "" }
    
    foreach ($networkName in $networkNames) {
        try {
            Write-Host "   Suppression de $networkName..." -ForegroundColor Gray
            docker network rm $networkName 2>$null
            Write-Host "   ✅ $networkName supprimé" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️ Erreur avec $networkName : $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
} else {
    Write-Host "✅ Aucun réseau QR codes trouvé" -ForegroundColor Green
}

Write-Host "🎉 Nettoyage des containers QR codes terminé !" -ForegroundColor Green
Write-Host "💡 Vous pouvez maintenant démarrer le service QR codes principal avec:" -ForegroundColor Cyan
Write-Host "   cd essentiels\qrcodes && docker-compose up -d" -ForegroundColor Gray










