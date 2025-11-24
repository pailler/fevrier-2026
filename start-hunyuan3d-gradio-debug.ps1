# Script de démarrage avec logs détaillés pour diagnostiquer les problèmes
Write-Host "🚀 Démarrage de Hunyuan3D Gradio (mode debug)..." -ForegroundColor Cyan
Write-Host ""

$scriptPath = "C:\Users\AAA\Documents\iahome\hunyuan2-spz\run-browser_(slower)\run-gradio-turbo-multiview-RECOMMENDED.bat"
$workingDir = Split-Path $scriptPath

if (-not (Test-Path $scriptPath)) {
    Write-Host "❌ Script non trouvé: $scriptPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Script trouvé: $scriptPath" -ForegroundColor Green
Write-Host "📂 Répertoire de travail: $workingDir" -ForegroundColor Gray
Write-Host ""

# Vérifier si le port est déjà utilisé
$portCheck = netstat -ano | findstr ":8888"
if ($portCheck) {
    Write-Host "⚠️  Port 8888 déjà utilisé" -ForegroundColor Yellow
    Write-Host "   Arrêt du processus existant..." -ForegroundColor Gray
    $portProcess = Get-NetTCPConnection -LocalPort 8888 -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -First 1
    if ($portProcess) {
        Stop-Process -Id $portProcess -Force -ErrorAction SilentlyContinue
        Start-Sleep -Seconds 5
        Write-Host "   ✅ Processus arrêté" -ForegroundColor Green
    }
}

Write-Host "🚀 Démarrage du service..." -ForegroundColor Cyan
Write-Host "   Une fenêtre de commande va s'ouvrir pour voir les logs" -ForegroundColor Gray
Write-Host ""

# Créer un fichier de log
$logFile = Join-Path $PSScriptRoot "logs\hunyuan3d-startup.log"
$logDir = Split-Path $logFile
if (-not (Test-Path $logDir)) {
    New-Item -ItemType Directory -Path $logDir -Force | Out-Null
}

# Démarrer avec fenêtre visible pour voir les erreurs
Set-Location $workingDir
Start-Process -FilePath "cmd.exe" -ArgumentList "/k", "`"$scriptPath`"" -WindowStyle Normal

Write-Host "✅ Commande de démarrage exécutée" -ForegroundColor Green
Write-Host ""
Write-Host "⏳ Attente du démarrage..." -ForegroundColor Yellow
Write-Host "   Le chargement des modèles peut prendre 5-15 minutes" -ForegroundColor Gray
Write-Host "   Vérifiez la fenêtre de commande pour voir les logs" -ForegroundColor Gray
Write-Host ""

# Attendre et vérifier périodiquement
$maxWait = 20  # 20 minutes max
$attempt = 0

while ($attempt -lt $maxWait) {
    $attempt++
    Start-Sleep -Seconds 60
    
    $portCheck = netstat -ano | findstr ":8888"
    if ($portCheck) {
        Write-Host "[Tentative $attempt] ✅ Port 8888 est en écoute!" -ForegroundColor Green
        
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
            Write-Host "   ✅ Service accessible - Status: $($response.StatusCode)" -ForegroundColor Green
            
            if ($response.Content -match "gradio|Gradio|<!DOCTYPE|<html") {
                Write-Host ""
                Write-Host "🎉 Interface Gradio est prête!" -ForegroundColor Green
                Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
                Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
                break
            }
        } catch {
            Write-Host "   ⏳ Port ouvert mais service pas encore prêt..." -ForegroundColor Yellow
        }
    } else {
        Write-Host "[Tentative $attempt] ⏳ Port 8888 pas encore en écoute..." -ForegroundColor Yellow
    }
}

if ($attempt -ge $maxWait) {
    Write-Host ""
    Write-Host "⚠️  Le service n'est pas encore prêt après $maxWait minutes" -ForegroundColor Yellow
    Write-Host "   Vérifiez la fenêtre de commande pour voir les erreurs" -ForegroundColor Gray
}


