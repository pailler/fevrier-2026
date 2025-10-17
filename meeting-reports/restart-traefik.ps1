# Script pour redémarrer Traefik et appliquer la nouvelle configuration
Write-Host "🔄 Redémarrage de Traefik avec la nouvelle configuration..." -ForegroundColor Green

# 1. Arrêter Traefik s'il est en cours d'exécution
Write-Host "⏹️ Arrêt de Traefik..." -ForegroundColor Yellow
Get-Process | Where-Object { $_.ProcessName -like "*traefik*" } | Stop-Process -Force -ErrorAction SilentlyContinue

# 2. Attendre un moment
Start-Sleep -Seconds 3

# 3. Redémarrer Traefik
Write-Host "▶️ Redémarrage de Traefik..." -ForegroundColor Cyan
Start-Process -FilePath "C:\Users\AAA\Documents\iahome\traefik\traefik.exe" -ArgumentList "--configfile=C:\Users\AAA\Documents\iahome\traefik\traefik.yml" -WorkingDirectory "C:\Users\AAA\Documents\iahome\traefik" -WindowStyle Hidden

# 4. Attendre que Traefik démarre
Write-Host "⏳ Attente du démarrage de Traefik..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 5. Tester la configuration
Write-Host "🧪 Test de la configuration..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://meeting-reports.iahome.fr/api/reports" -TimeoutSec 10 -ErrorAction Stop
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Configuration Traefik appliquée avec succès !" -ForegroundColor Green
        Write-Host "🌐 API accessible via : https://meeting-reports.iahome.fr/api" -ForegroundColor Green
    } else {
        Write-Host "❌ Problème avec la configuration Traefik" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test de la configuration : $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "ℹ️ Traefik peut encore être en cours de démarrage. Réessayez dans quelques minutes." -ForegroundColor Yellow
}

Write-Host "✅ Script terminé." -ForegroundColor Green
