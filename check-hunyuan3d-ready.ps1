# Script pour vérifier si Hunyuan3D Gradio est prêt
Write-Host "🔍 Vérification de l'état de Hunyuan3D Gradio..." -ForegroundColor Cyan
Write-Host ""

# Vérifier si le port 8888 est en écoute
$portCheck = netstat -ano | findstr ":8888"
if ($portCheck) {
    Write-Host "✅ Port 8888 est en écoute" -ForegroundColor Green
    
    # Essayer de se connecter au service
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8888" -TimeoutSec 5 -ErrorAction Stop
        Write-Host "✅ Service accessible - Status: $($response.StatusCode)" -ForegroundColor Green
        
        $contentPreview = $response.Content.Substring(0, [Math]::Min(1000, $response.Content.Length))
        
        if ($contentPreview -match "gradio|Gradio|<!DOCTYPE|<html|<body") {
            Write-Host "✅ Interface Gradio détectée!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Service prêt:" -ForegroundColor Cyan
            Write-Host "   • Local: http://localhost:8888" -ForegroundColor White
            Write-Host "   • Production: https://hunyuan3d.iahome.fr" -ForegroundColor White
            Write-Host ""
            Write-Host "✅ Le service est opérationnel!" -ForegroundColor Green
            exit 0
        } elseif ($contentPreview -match '{"message"|"API"|"StableProjectorz"|"status"') {
            Write-Host "⚠️  API StableProjectorz détectée (pas l'interface Gradio)" -ForegroundColor Yellow
            Write-Host ""
            Write-Host "💡 Pour utiliser l'interface Gradio:" -ForegroundColor Cyan
            Write-Host "   1. Arrêtez le processus API actuel" -ForegroundColor White
            Write-Host "   2. Démarrez le script Gradio:" -ForegroundColor White
            Write-Host "      cd hunyuan2-spz\run-browser_(slower" -ForegroundColor Gray
            Write-Host "      run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor Gray
            exit 1
        } else {
            Write-Host "📄 Contenu détecté mais type non identifié" -ForegroundColor Yellow
            Write-Host "   Aperçu: $($contentPreview.Substring(0, [Math]::Min(200, $contentPreview.Length)))" -ForegroundColor Gray
        }
    } catch {
        Write-Host "⏳ Port ouvert mais service pas encore prêt..." -ForegroundColor Yellow
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Gray
        Write-Host "   Le chargement des modèles est en cours (peut prendre 5-15 minutes)" -ForegroundColor Gray
    }
} else {
    Write-Host "❌ Port 8888 n'est pas en écoute" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Le service n'est pas démarré. Pour démarrer:" -ForegroundColor Cyan
    Write-Host "   cd hunyuan2-spz\run-browser_(slower" -ForegroundColor White
    Write-Host "   run-gradio-turbo-multiview-RECOMMENDED.bat" -ForegroundColor White
    Write-Host ""
    Write-Host "   Ou utilisez:" -ForegroundColor Gray
    Write-Host "   .\start-hunyuan3d.ps1" -ForegroundColor Gray
}

Write-Host ""


