# Script pour démarrer le tunnel iahome avec configuration complète
# Utilise le token existant mais avec tous les domaines

Write-Host "🚀 Démarrage du tunnel iahome avec configuration complète..." -ForegroundColor Green

$configPath = "ssl/cloudflare/config-token-complete.yml"
$tunnelId = "9f502e05-14b3-4b40-ab89-b8673b2012ab"

Write-Host "`n📋 Configuration:" -ForegroundColor Yellow
Write-Host "   • Fichier: $configPath" -ForegroundColor White
Write-Host "   • Tunnel ID: $tunnelId" -ForegroundColor White

# Vérifier que la configuration existe
if (Test-Path $configPath) {
    Write-Host "✅ Configuration trouvée" -ForegroundColor Green
} else {
    Write-Host "❌ Configuration manquante: $configPath" -ForegroundColor Red
    exit 1
}

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
    Start-Sleep -Seconds 5
}

# Démarrer le tunnel avec la configuration complète
Write-Host "`n🚀 Démarrage du tunnel avec configuration complète..." -ForegroundColor Yellow

Write-Host "Commande: cloudflared tunnel run --config $configPath" -ForegroundColor Cyan

Start-Process -FilePath "cloudflared.exe" -ArgumentList "tunnel", "run", "--config", $configPath -NoNewWindow -PassThru | Out-Null

Write-Host "✅ Tunnel démarré avec succès!" -ForegroundColor Green

# Attendre la connexion
Write-Host "`n⏳ Attente de la connexion du tunnel (60 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 60

# Tests de connectivité
Write-Host "`n🧪 Tests de connectivité..." -ForegroundColor Yellow

$testDomains = @("iahome.fr", "librespeed.iahome.fr", "qrcodes.iahome.fr")

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
        if ($_.Exception.Message -like "*Hôte inconnu*") {
            Write-Host "   ❌ $domain - Hôte inconnu (DNS)" -ForegroundColor Red
        } elseif ($_.Exception.Message -like "*1033*") {
            Write-Host "   ❌ $domain - Erreur 1033 (Tunnel hors service)" -ForegroundColor Red
        } elseif ($_.Exception.Message -like "*530*") {
            Write-Host "   ❌ $domain - Erreur 530 (Service indisponible)" -ForegroundColor Red
        } elseif ($_.Exception.Message -like "*404*") {
            Write-Host "   ❌ $domain - Erreur 404 (Non trouvé)" -ForegroundColor Red
        } else {
            Write-Host "   ❌ $domain - Erreur: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎯 Résumé..." -ForegroundColor Green
Write-Host "✅ Tunnel démarré avec configuration complète!" -ForegroundColor Green

Write-Host "`n🔗 Services disponibles:" -ForegroundColor Cyan
Write-Host "   • https://iahome.fr (Application principale)" -ForegroundColor White
Write-Host "   • https://librespeed.iahome.fr (LibreSpeed avec authentification)" -ForegroundColor White
Write-Host "   • https://qrcodes.iahome.fr (QR Codes avec authentification)" -ForegroundColor White

Write-Host "`n🏁 Démarrage terminé!" -ForegroundColor Green
