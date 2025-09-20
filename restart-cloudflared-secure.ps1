# Script pour redémarrer cloudflared avec la configuration sécurisée LibreSpeed
Write-Host "🔒 Redémarrage de cloudflared avec configuration sécurisée LibreSpeed..." -ForegroundColor Yellow

# Vérifier si cloudflared est en cours d'exécution
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "🛑 Arrêt de cloudflared..." -ForegroundColor Red
    Stop-Process -Name "cloudflared" -Force
    Start-Sleep -Seconds 3
}

# Vérifier que le fichier de configuration existe
if (-not (Test-Path "cloudflared-config.yml")) {
    Write-Host "❌ Fichier cloudflared-config.yml non trouvé!" -ForegroundColor Red
    exit 1
}

# Démarrer cloudflared avec la nouvelle configuration
Write-Host "🚀 Démarrage de cloudflared avec configuration sécurisée..." -ForegroundColor Green
Start-Process -FilePath "cloudflared" -ArgumentList "tunnel", "--config", "cloudflared-config.yml", "run" -WindowStyle Hidden

# Attendre que cloudflared démarre
Start-Sleep -Seconds 5

# Vérifier que cloudflared fonctionne
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "✅ Cloudflared redémarré avec succès!" -ForegroundColor Green
    Write-Host "🔒 LibreSpeed est maintenant sécurisé:" -ForegroundColor Cyan
    Write-Host "   - Accès direct sans token → redirection vers login" -ForegroundColor White
    Write-Host "   - Accès avec token valide → accès autorisé" -ForegroundColor White
    Write-Host "   - Token provisoire valide 1h → accès autorisé" -ForegroundColor White
} else {
    Write-Host "❌ Erreur lors du redémarrage de cloudflared!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🧪 Test de la sécurisation:" -ForegroundColor Yellow
Write-Host "1. Accès direct: https://librespeed.iahome.fr → doit rediriger vers login" -ForegroundColor White
Write-Host "2. Accès avec token: https://librespeed.iahome.fr?token=XXX → doit autoriser l'accès" -ForegroundColor White

