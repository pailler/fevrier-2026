# Script pour recharger la configuration cloudflared
Write-Host "🔄 Rechargement de la configuration cloudflared..." -ForegroundColor Yellow

# Vérifier si cloudflared fonctionne
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if (-not $cloudflaredProcess) {
    Write-Host "❌ Cloudflared n'est pas en cours d'exécution!" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Cloudflared est en cours d'exécution (PID: $($cloudflaredProcess.Id))" -ForegroundColor Green

# Vérifier la configuration actuelle
Write-Host "`n📋 Configuration actuelle:" -ForegroundColor Cyan
Get-Content "cloudflared-config.yml" | Select-String -Pattern "librespeed" -Context 2

# Tester l'API de redirection directement
Write-Host "`n🧪 Test de l'API de redirection:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/librespeed-redirect" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Tester l'accès direct à LibreSpeed
Write-Host "`n🧪 Test de l'accès direct à LibreSpeed:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Pas de redirection - LibreSpeed est accessible directement" -ForegroundColor Yellow
    }
} catch {
    Write-Host "Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 Si LibreSpeed est toujours accessible directement:" -ForegroundColor Yellow
Write-Host "1. Vérifiez que cloudflared utilise le bon fichier de configuration" -ForegroundColor White
Write-Host "2. Redémarrez le service cloudflared" -ForegroundColor White
Write-Host "3. Vérifiez les logs cloudflared" -ForegroundColor White

