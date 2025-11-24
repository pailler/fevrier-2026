# Script pour vérifier le statut de Hunyuan 3D
Write-Host "🔍 Vérification du statut de Hunyuan 3D..." -ForegroundColor Cyan

# Vérifier si le port 8888 est en écoute
$portCheck = netstat -ano | findstr ":8888"
if ($portCheck) {
    Write-Host "✅ Port 8888 est en écoute" -ForegroundColor Green
    Write-Host "   $portCheck" -ForegroundColor Gray
} else {
    Write-Host "❌ Port 8888 n'est pas en écoute" -ForegroundColor Red
}

# Vérifier si le service répond
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
    Write-Host "✅ Service Hunyuan 3D est accessible" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host "   URL: http://localhost:8888" -ForegroundColor Gray
    Write-Host "   Production: https://hunyuan3d.iahome.fr" -ForegroundColor Gray
} catch {
    Write-Host "⏳ Service en cours de démarrage..." -ForegroundColor Yellow
    Write-Host "   Le chargement des modèles peut prendre plusieurs minutes" -ForegroundColor Gray
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
}

# Vérifier les processus Python/Gradio
$pythonProcesses = Get-Process | Where-Object {$_.ProcessName -like "*python*"} | Select-Object ProcessName, Id, StartTime
if ($pythonProcesses) {
    Write-Host "`n📊 Processus Python trouvés:" -ForegroundColor Cyan
    $pythonProcesses | Format-Table
} else {
    Write-Host "`n⚠️ Aucun processus Python trouvé" -ForegroundColor Yellow
}


