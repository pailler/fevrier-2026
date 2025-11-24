# Script pour attendre que Hunyuan 3D soit prêt
Write-Host "⏳ Attente que Hunyuan 3D soit prêt..." -ForegroundColor Cyan
Write-Host ""

$maxWait = 10  # 10 minutes maximum
$attempt = 0
$ready = $false

while ($attempt -lt $maxWait -and -not $ready) {
    $attempt++
    Write-Host "[Tentative $attempt/$maxWait] Vérification..." -ForegroundColor Yellow
    
    # Vérifier si le port est en écoute
    $portCheck = netstat -ano | findstr ":8888"
    
    if ($portCheck) {
        Write-Host "   ✅ Port 8888 est en écoute" -ForegroundColor Green
        
        # Essayer de se connecter
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "   ✅ Service Hunyuan 3D est PRÊT!" -ForegroundColor Green
            Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
            Write-Host ""
            Write-Host "🌐 Service accessible sur:" -ForegroundColor Cyan
            Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
            Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
            $ready = $true
        } catch {
            Write-Host "   ⏳ Port ouvert mais service pas encore prêt..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "   ⏳ Port 8888 pas encore en écoute..." -ForegroundColor Yellow
    }
    
    if (-not $ready) {
        Write-Host "   Attente de 1 minute avant la prochaine vérification..." -ForegroundColor Gray
        Start-Sleep -Seconds 60
        Write-Host ""
    }
}

if (-not $ready) {
    Write-Host ""
    Write-Host "⚠️  Le service n'est pas encore prêt après $maxWait minutes" -ForegroundColor Yellow
    Write-Host "   Le chargement des modèles peut prendre jusqu'à 15 minutes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "💡 Vérifications:" -ForegroundColor Cyan
    Write-Host "   • Vérifiez les fenêtres de commande pour voir les logs" -ForegroundColor White
    Write-Host "   • Le service peut nécessiter plus de temps pour charger les modèles" -ForegroundColor White
}


