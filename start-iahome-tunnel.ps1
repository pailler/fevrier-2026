# Script pour démarrer le tunnel iahome avec le token
# Solution radicale : utilisation directe du token

Write-Host "🚀 Démarrage du tunnel iahome avec token..." -ForegroundColor Green

$token = "eyJhIjoiOWJhNDI5NGFhNzg3ZTY3YzMzNWM3MTg3NmMxMGFmMjEiLCJzIjoiTmprd09Ua3paR0V0WWpFNU5pMDBaREE1TFdJM1pUSXRZemMzTm1GbU9ESXpPR1l3IiwidCI6IjlmNTAyZTA1LTE0YjMtNGI0MC1hYjg5LWI4NjczYjIwMTJhYiJ9"

Write-Host "`n📋 Token utilisé:" -ForegroundColor Yellow
Write-Host "   Token: $($token.Substring(0, 50))..." -ForegroundColor White

# Arrêter les processus existants
Write-Host "`n🛑 Arrêt des processus cloudflared existants..." -ForegroundColor Yellow

$cloudflaredProcesses = Get-Process "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcesses) {
    Write-Host "Arrêt de $($cloudflaredProcesses.Count) processus cloudflared..." -ForegroundColor Cyan
    foreach ($proc in $cloudflaredProcesses) {
        try {
            Stop-Process -Id $proc.Id -Force -ErrorAction Stop
            Write-Host "   ✅ PID $($proc.Id) arrêté" -ForegroundColor Green
        } catch {
            Write-Host "   ⚠️  Impossible d'arrêter le PID: $($proc.Id)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
}

# Démarrer le tunnel avec le token
Write-Host "`n🚀 Démarrage du tunnel avec token..." -ForegroundColor Yellow

Write-Host "Commande: cloudflared tunnel run --token $($token.Substring(0, 20))..." -ForegroundColor Cyan

Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "run", "--token", $token -NoNewWindow -PassThru | Out-Null

Write-Host "✅ Tunnel démarré avec succès!" -ForegroundColor Green

# Attendre la connexion
Write-Host "`n⏳ Attente de la connexion du tunnel (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

# Tests de connectivité
Write-Host "`n🧪 Tests de connectivité..." -ForegroundColor Yellow

$testDomains = @("librespeed.iahome.fr", "qrcodes.iahome.fr")

foreach ($domain in $testDomains) {
    Write-Host "Test de $domain..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "https://$domain" -UseBasicParsing -TimeoutSec 15
        if ($response.StatusCode -eq 200) {
            Write-Host "   ✅ $domain - OK" -ForegroundColor Green
        } else {
            Write-Host "   ⚠️  $domain - Code: $($response.StatusCode)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "   ❌ $domain - Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎯 Résumé..." -ForegroundColor Green
Write-Host "✅ Tunnel iahome démarré avec succès!" -ForegroundColor Green
Write-Host "`n🔗 Services disponibles:" -ForegroundColor Cyan
Write-Host "   • https://librespeed.iahome.fr (LibreSpeed avec authentification)" -ForegroundColor White
Write-Host "   • https://qrcodes.iahome.fr (QR Codes avec authentification)" -ForegroundColor White

Write-Host "`n🏁 Démarrage terminé!" -ForegroundColor Green
