# Force restart cloudflared with correct config
Write-Host "🔄 Solution QR Codes Cloudflare" -ForegroundColor Cyan

# 1. Trouver tous les tunnels cloudflared
Write-Host "`n📋 Tunnels actifs:" -ForegroundColor Yellow
Get-Process -Name cloudflared | Format-Table Id, StartTime, CPU

# 2. L'ancien tunnel (PID 27840) doit être arrêté
# Mais nous ne pouvons pas le tuer car il bloque
Write-Host "`n⚠️  L'ancien tunnel (PID 27840) ne peut pas être arrêté" -ForegroundColor Yellow
Write-Host "✅ Nous allons utiliser le nouveau tunnel (PID 35104)" -ForegroundColor Green

# 3. Vérifier le service local
Write-Host "`n🧪 Test du service QR Codes local:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri http://localhost:7006/ -UseBasicParsing -TimeoutSec 5
    if ($response.Content -match "QR Code Generator") {
        Write-Host "✅ Service local fonctionne sur port 7006" -ForegroundColor Green
    } else {
        Write-Host "❌ Service local retourne le mauvais contenu" -ForegroundColor Red
        Write-Host "   Contenu: $($response.Content.Substring(0, [Math]::Min(100, $response.Content.Length)))" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

# 4. Vérifier le routage Cloudflare
Write-Host "`n🌐 Test via Cloudflare:" -ForegroundColor Cyan
try {
    $cloudflareResponse = Invoke-WebRequest -Uri https://qrcodes.iahome.fr/ -UseBasicParsing -TimeoutSec 10
    Write-Host "   Status: $($cloudflareResponse.StatusCode)" -ForegroundColor Gray
    if ($cloudflareResponse.Content -match "Meeting Reports") {
        Write-Host "❌ Cloudflare route vers MEETING REPORTS au lieu de QR CODES" -ForegroundColor Red
        Write-Host "`n🔧 SOLUTION:" -ForegroundColor Yellow
        Write-Host "1. Arrêter l'ancien tunnel manuellement via Gestionnaire des tâches (PID 27840)" -ForegroundColor White
        Write-Host "2. Attendre 30 secondes" -ForegroundColor White
        Write-Host "3. Tester: curl https://qrcodes.iahome.fr/" -ForegroundColor White
    } elseif ($cloudflareResponse.Content -match "QR Code Generator") {
        Write-Host "✅ Cloudflare route correctement vers QR Codes" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Contenu inattendu" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Erreur: $_" -ForegroundColor Red
}

Write-Host "`n📌 Configuration attendue:" -ForegroundColor Cyan
Write-Host "   qrcodes.iahome.fr → http://localhost:7006" -ForegroundColor White

