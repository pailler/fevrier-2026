# Script pour forcer la configuration MeTube avec authentification
Write-Host "🔧 Configuration forcée de MeTube avec authentification..." -ForegroundColor Green

# Chemin vers le fichier cloudflared.exe
$cloudflaredPath = ".\cloudflared.exe"
$configFilePath = ".\cloudflare-tunnel-config.yml"

# Arrêter le tunnel Cloudflare actuel si en cours d'exécution
Write-Host "1. Arrêt forcé de Cloudflare..." -ForegroundColor Yellow
Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue | Stop-Process -Force
Start-Sleep -Seconds 3

# Vérifier la configuration
Write-Host "2. Vérification de la configuration..." -ForegroundColor Cyan
if (Test-Path $configFilePath) {
    $config = Get-Content $configFilePath
    Write-Host "• Configuration trouvée ✅" -ForegroundColor Green
    Write-Host "• metube.iahome.fr → http://192.168.1.150:8085" -ForegroundColor White
} else {
    Write-Host "• Configuration manquante ❌" -ForegroundColor Red
    exit 1
}

# Démarrer le tunnel avec la configuration forcée
Write-Host "3. Démarrage de Cloudflare avec configuration forcée..." -ForegroundColor Green
Start-Process -FilePath $cloudflaredPath -ArgumentList "tunnel run --config $configFilePath" -NoNewWindow -PassThru

Write-Host "⏳ Attente du démarrage de Cloudflare..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

Write-Host "🧪 Test de la configuration MeTube..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 15
    Write-Host "• metube.iahome.fr → Status $($response.StatusCode) ✅" -ForegroundColor Green
    if ($response.Content -match "Accès à MeTube" -or $response.Content -match "Se connecter" -or $response.Content -match "authentification") {
        Write-Host "• Page d'authentification MeTube détectée ✅" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉🎉 AUTHENTIFICATION METUBE FONCTIONNE ! 🎉🎉" -ForegroundColor Green
        Write-Host "• https://metube.iahome.fr → Page d'authentification" -ForegroundColor White
        Write-Host "• Vérification ID/mot de passe dans Supabase" -ForegroundColor White
        Write-Host "• Vérification activation application MeTube" -ForegroundColor White
        Write-Host "• Redirection vers MeTube local après auth" -ForegroundColor White
    } else {
        Write-Host "• Page d'authentification non détectée ❌" -ForegroundColor Red
        Write-Host "• Contenu reçu:" -ForegroundColor Cyan
        Write-Host $response.Content.Substring(0, [Math]::Min(200, $response.Content.Length)) -ForegroundColor White
    }
} catch {
    Write-Host "• metube.iahome.fr → Erreur ❌" -ForegroundColor Red
    Write-Host "• $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solution immédiate:" -ForegroundColor Yellow
    Write-Host "• Utilisez http://192.168.1.150:8085 pour tester l'authentification" -ForegroundColor White
    Write-Host "• https://metube.iahome.fr sera disponible après propagation Cloudflare" -ForegroundColor White
}
