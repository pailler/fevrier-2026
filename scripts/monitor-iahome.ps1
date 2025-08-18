# Script de monitoring pour IAHOME en production
Write-Host "📊 Monitoring d'IAHOME en production..." -ForegroundColor Cyan

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erreur: Ce script doit être exécuté depuis le répertoire racine du projet" -ForegroundColor Red
    exit 1
}

# Fonction pour afficher le statut avec des couleurs
function Show-Status {
    param($Status, $Message)
    switch ($Status) {
        "OK" { Write-Host "✅ $Message" -ForegroundColor Green }
        "WARNING" { Write-Host "⚠️ $Message" -ForegroundColor Yellow }
        "ERROR" { Write-Host "❌ $Message" -ForegroundColor Red }
        "INFO" { Write-Host "ℹ️ $Message" -ForegroundColor Cyan }
    }
}

# 1. Vérifier Docker
try {
    docker ps > $null 2>&1
    Show-Status "OK" "Docker est en cours d'exécution"
} catch {
    Show-Status "ERROR" "Docker n'est pas en cours d'exécution"
    exit 1
}

# 2. Vérifier les conteneurs
Write-Host "`n📦 Statut des conteneurs:" -ForegroundColor Cyan
$containers = docker-compose -f docker-compose.prod.yml ps --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"
Write-Host $containers -ForegroundColor White

# 3. Vérifier l'utilisation des ressources
Write-Host "`n💾 Utilisation des ressources:" -ForegroundColor Cyan
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}\t{{.NetIO}}"

# 4. Vérifier la santé de l'application
Write-Host "`n🏥 Santé de l'application:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $healthData = $response.Content | ConvertFrom-Json
        Show-Status "OK" "Application accessible (Status: $($healthData.status))"
        Show-Status "INFO" "Uptime: $([math]::Round($healthData.uptime / 3600, 1)) heures"
        Show-Status "INFO" "Environnement: $($healthData.environment)"
        
        # Vérifier les services
        if ($healthData.services) {
            Write-Host "   Services:" -ForegroundColor White
            foreach ($service in $healthData.services.PSObject.Properties) {
                $status = $service.Value.status
                $responseTime = $service.Value.responseTime
                switch ($status) {
                    "ok" { Show-Status "OK" "   $($service.Name): OK ($responseTime)" }
                    "error" { Show-Status "ERROR" "   $($service.Name): ERREUR ($responseTime)" }
                    default { Show-Status "WARNING" "   $($service.Name): $status ($responseTime)" }
                }
            }
        }
    } else {
        Show-Status "WARNING" "Application accessible mais statut inattendu: $($response.StatusCode)"
    }
} catch {
    Show-Status "ERROR" "Impossible d'accéder à l'application: $($_.Exception.Message)"
}

# 5. Vérifier les logs récents
Write-Host "`n📋 Logs récents (dernières 5 lignes):" -ForegroundColor Cyan
try {
    $logs = docker logs iahome-app --tail 5 2>&1
    if ($logs) {
        Write-Host $logs -ForegroundColor Gray
    } else {
        Show-Status "INFO" "Aucun log récent"
    }
} catch {
    Show-Status "WARNING" "Impossible de récupérer les logs"
}

# 6. Vérifier l'accès au dashboard Traefik
Write-Host "`n🌐 Accès aux services:" -ForegroundColor Cyan
Show-Status "INFO" "Application principale: https://iahome.fr"
Show-Status "INFO" "Dashboard Traefik: http://localhost:8080"
Show-Status "INFO" "API Health: https://iahome.fr/api/health"

Write-Host "`n📊 Monitoring terminé !" -ForegroundColor Green





