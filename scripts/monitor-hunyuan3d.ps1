# Script de surveillance pour Hunyuan 3D
Write-Host "🔍 Surveillance du démarrage de Hunyuan 3D..." -ForegroundColor Cyan
Write-Host ""

$maxAttempts = 20  # 20 tentatives = 10 minutes max
$attempt = 0
$serviceReady = $false

while ($attempt -lt $maxAttempts -and -not $serviceReady) {
    $attempt++
    Write-Host "[Tentative $attempt/$maxAttempts] Vérification du service..." -ForegroundColor Yellow
    
    # Vérifier si le port est en écoute
    $portCheck = netstat -ano | findstr ":8888"
    
    if ($portCheck) {
        Write-Host "   ✅ Port 8888 est en écoute" -ForegroundColor Green
        
        # Essayer de se connecter au service
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "   ✅ Service Hunyuan 3D est accessible!" -ForegroundColor Green
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🌐 Service prêt:" -ForegroundColor Cyan
            Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
            Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
            $serviceReady = $true
        } catch {
            Write-Host "   ⏳ Port ouvert mais service pas encore prêt..." -ForegroundColor Yellow
            Write-Host "   (Le chargement des modèles est en cours)" -ForegroundColor Gray
        }
    } else {
        Write-Host "   ⏳ Port 8888 pas encore en écoute..." -ForegroundColor Yellow
    }
    
    if (-not $serviceReady) {
        Write-Host "   Attente de 30 secondes avant la prochaine vérification..." -ForegroundColor Gray
        Start-Sleep -Seconds 30
        Write-Host ""
    }
}

if (-not $serviceReady) {
    Write-Host ""
    Write-Host "⚠️  Le service n'est pas encore accessible après $maxAttempts tentatives" -ForegroundColor Yellow
    Write-Host "   Le chargement des modèles peut prendre jusqu'à 15 minutes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Vérifications manuelles:" -ForegroundColor Cyan
    Write-Host "   • Vérifiez les fenêtres de commande ouvertes pour voir les logs" -ForegroundColor White
    Write-Host "   • Vérifiez l'utilisation GPU avec: nvidia-smi" -ForegroundColor White
    Write-Host "   • Réessayez dans quelques minutes" -ForegroundColor White
}


