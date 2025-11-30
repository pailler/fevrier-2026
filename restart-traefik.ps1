# Script de redémarrage de Traefik
Write-Host "🔄 Redémarrage de Traefik..." -ForegroundColor Cyan

# Vérifier si Docker est disponible
try {
    $dockerVersion = docker --version 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "❌ Docker n'est pas disponible. Veuillez démarrer Docker Desktop." -ForegroundColor Red
        exit 1
    }
    Write-Host "✅ Docker détecté: $dockerVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Docker n'est pas disponible. Veuillez démarrer Docker Desktop." -ForegroundColor Red
    exit 1
}

# Redémarrer Traefik
Write-Host "🔄 Redémarrage du conteneur Traefik..." -ForegroundColor Yellow
try {
    docker restart iahome-traefik
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Traefik redémarré avec succès" -ForegroundColor Green
        Write-Host "⏳ Attente de 3 secondes pour le démarrage..." -ForegroundColor Yellow
        Start-Sleep -Seconds 3
        
        # Vérifier le statut
        $status = docker ps --filter "name=iahome-traefik" --format "{{.Status}}"
        if ($status) {
            Write-Host "✅ Traefik est en cours d'exécution: $status" -ForegroundColor Green
        } else {
            Write-Host "⚠️  Traefik ne semble pas être en cours d'exécution" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Erreur lors du redémarrage de Traefik" -ForegroundColor Red
        Write-Host "💡 Essayez: docker-compose -f docker-compose.prod.yml restart traefik" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
    Write-Host "💡 Assurez-vous que Docker Desktop est démarré" -ForegroundColor Yellow
}


