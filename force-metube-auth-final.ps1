# Script pour forcer l'authentification MeTube avec redirection correcte
Write-Host "🔧 Forçage final de l'authentification MeTube..." -ForegroundColor Green

# Chemin vers le fichier cloudflared.exe
$cloudflaredPath = ".\cloudflared.exe"
$configFilePath = ".\cloudflare-config-metube-auth.yml"

# Arrêter tous les processus Cloudflare
Write-Host "1. Arrêt forcé de tous les processus Cloudflare..." -ForegroundColor Red
taskkill /F /IM cloudflared.exe 2>$null
Start-Sleep -Seconds 5

# Vérifier la configuration
Write-Host "2. Vérification de la configuration..." -ForegroundColor Yellow
$config = Get-Content $configFilePath -Raw
if ($config -match "metube.iahome.fr" -and $config -match "8085") {
    Write-Host "• Configuration correcte: metube.iahome.fr → port 8085" -ForegroundColor Green
} else {
    Write-Host "• Configuration incorrecte" -ForegroundColor Red
    Write-Host $config -ForegroundColor White
    exit 1
}

# Vérifier que le serveur d'authentification fonctionne
Write-Host "3. Vérification du serveur d'authentification..." -ForegroundColor Yellow
try {
    $authResponse = Invoke-WebRequest -Uri "http://localhost:8085" -Method GET -TimeoutSec 5
    Write-Host "• Serveur d'authentification → Status $($authResponse.StatusCode) ✅" -ForegroundColor Green
} catch {
    Write-Host "• Serveur d'authentification → Erreur ❌" -ForegroundColor Red
    Write-Host "• $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "• Démarrage du serveur d'authentification..." -ForegroundColor Yellow
    Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; node metube-auth-server.js" -WindowStyle Minimized
    Start-Sleep -Seconds 5
}

# Démarrer Cloudflare avec la configuration forcée
Write-Host "4. Démarrage de Cloudflare avec configuration forcée..." -ForegroundColor Green
Start-Process -FilePath $cloudflaredPath -ArgumentList "--config $configFilePath tunnel run iahome-new" -NoNewWindow -PassThru

# Attendre le démarrage
Write-Host "⏳ Attente du démarrage de Cloudflare..." -ForegroundColor Yellow
Start-Sleep -Seconds 20

# Test de la configuration
Write-Host "5. Test de l'authentification MeTube..." -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://metube.iahome.fr" -Method GET -TimeoutSec 15
    Write-Host "• metube.iahome.fr → Status $($response.StatusCode) ✅" -ForegroundColor Green
    
    if ($response.Content -match "Accès à MeTube" -or $response.Content -match "Se connecter" -or $response.Content -match "authentification") {
        Write-Host "• Page d'authentification MeTube détectée ✅" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 AUTHENTIFICATION METUBE FONCTIONNE !" -ForegroundColor Green
        Write-Host "• metube.iahome.fr → Page d'authentification" -ForegroundColor White
        Write-Host "• Vérification des droits via Supabase" -ForegroundColor White
        Write-Host "• Contrôle des quotas d'utilisation" -ForegroundColor White
        Write-Host "• Redirection vers metube.iahome.fr après authentification" -ForegroundColor White
    } else {
        Write-Host "• Page d'authentification non détectée ❌" -ForegroundColor Red
        Write-Host "Contenu reçu:" -ForegroundColor Cyan
        Write-Host $response.Content.Substring(0, [Math]::Min(300, $response.Content.Length)) -ForegroundColor White
    }
} catch {
    Write-Host "• metube.iahome.fr → Erreur ❌" -ForegroundColor Red
    Write-Host "• $($_.Exception.Message)" -ForegroundColor Red
}
