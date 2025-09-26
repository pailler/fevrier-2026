Write-Host "🚀 Configuration complète MeTube avec page d'identification..." -ForegroundColor Green
Write-Host ""

# 1. Démarrer le serveur d'authentification
Write-Host "1. Démarrage du serveur d'authentification..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; .\start-metube-auth-simple.ps1" -WindowStyle Minimized

# Attendre que le serveur démarre
Write-Host "⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Arrêter Cloudflare actuel
Write-Host "2. Arrêt de Cloudflare actuel..." -ForegroundColor Cyan
taskkill /F /IM cloudflared.exe 2>$null
Start-Sleep -Seconds 2

# 3. Démarrer Cloudflare avec la nouvelle configuration
Write-Host "3. Démarrage de Cloudflare avec page d'identification MeTube..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; .\cloudflared.exe tunnel --config cloudflare-config-metube-simple.yml run" -WindowStyle Minimized

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host "• metube.iahome.fr → Page d'identification → MeTube" -ForegroundColor White
Write-Host "• Serveur d'authentification: http://localhost:8085" -ForegroundColor White
Write-Host "• MeTube direct: http://192.168.1.150:8081" -ForegroundColor White
Write-Host ""
Write-Host "🧪 Test dans quelques secondes..." -ForegroundColor Yellow
Start-Sleep -Seconds 8

# Test de la configuration
Write-Host "🔍 Test de la configuration..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 10
    Write-Host "• metube.iahome.fr → Status $($response.StatusCode) ✅" -ForegroundColor Green
    if ($response.Content -like "*Accès à MeTube*" -or $response.Content -like "*identifier*" -or $response.Content -like "*email*") {
        Write-Host "• Page d'identification détectée ✅" -ForegroundColor Green
        Write-Host "• L'utilisateur doit maintenant s'identifier avant d'accéder à MeTube" -ForegroundColor Green
    } else {
        Write-Host "• Page d'identification non détectée ❌" -ForegroundColor Red
        Write-Host "• Contient 'Accès à MeTube': $($response.Content -like '*Accès à MeTube*')" -ForegroundColor Cyan
        Write-Host "• Contient 'email': $($response.Content -like '*email*')" -ForegroundColor Cyan
    }
} catch {
    Write-Host "• metube.iahome.fr → Erreur ❌" -ForegroundColor Red
    Write-Host "• $($_.Exception.Message)" -ForegroundColor Red
}
