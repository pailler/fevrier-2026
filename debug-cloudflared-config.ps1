# Script pour déboguer la configuration cloudflared
Write-Host "🔍 Débogage de la configuration cloudflared..." -ForegroundColor Yellow

# Vérifier les processus cloudflared
Write-Host "`n📊 Processus cloudflared en cours:" -ForegroundColor Cyan
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        Write-Host "   PID: $($_.Id) - StartTime: $($_.StartTime)" -ForegroundColor White
    }
} else {
    Write-Host "   Aucun processus cloudflared" -ForegroundColor Red
}

# Vérifier les tunnels
Write-Host "`n🌐 Tunnels disponibles:" -ForegroundColor Cyan
try {
    $tunnels = & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel list
    Write-Host $tunnels
} catch {
    Write-Host "❌ Erreur lors de la liste des tunnels: $($_.Exception.Message)" -ForegroundColor Red
}

# Vérifier la configuration actuelle
Write-Host "`n📋 Configuration actuelle (ssl/cloudflare/config.yml):" -ForegroundColor Cyan
if (Test-Path "ssl\cloudflare\config.yml") {
    Get-Content "ssl\cloudflare\config.yml"
} else {
    Write-Host "❌ Fichier de configuration non trouvé" -ForegroundColor Red
}

# Tester l'API de redirection
Write-Host "`n🧪 Test de l'API de redirection:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/librespeed-redirect" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    Write-Host "❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
}

# Tester l'accès direct à LibreSpeed
Write-Host "`n🧪 Test de l'accès direct à LibreSpeed:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
    } else {
        Write-Host "⚠️ Pas de redirection - LibreSpeed accessible directement" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
}

# Vérifier si cloudflared utilise un tunnel existant
Write-Host "`n🔍 Vérification du tunnel actif:" -ForegroundColor Cyan
try {
    $tunnelInfo = & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel info iahome-tunnel
    Write-Host "Tunnel iahome-tunnel:" -ForegroundColor White
    Write-Host $tunnelInfo
} catch {
    Write-Host "❌ Erreur tunnel info: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n💡 Diagnostic:" -ForegroundColor Yellow
Write-Host "1. Si l'API fonctionne mais LibreSpeed ne redirige pas:" -ForegroundColor White
Write-Host "   → Cloudflared utilise un tunnel configuré dans Cloudflare" -ForegroundColor White
Write-Host "2. Si aucun tunnel n'est actif:" -ForegroundColor White
Write-Host "   → Cloudflared n'utilise pas notre configuration" -ForegroundColor White
Write-Host "3. Solution: Modifier la configuration dans le dashboard Cloudflare" -ForegroundColor White

