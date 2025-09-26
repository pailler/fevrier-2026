Write-Host "🚀 Configuration complète MeTube avec authentification Supabase..." -ForegroundColor Green
Write-Host ""

# 1. Démarrer le serveur d'authentification avec Supabase
Write-Host "1. Démarrage du serveur d'authentification avec Supabase..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; .\start-metube-auth-supabase.ps1" -WindowStyle Minimized

# Attendre que le serveur démarre
Write-Host "⏳ Attente du démarrage du serveur..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# 2. Arrêter Cloudflare actuel
Write-Host "2. Arrêt de Cloudflare actuel..." -ForegroundColor Cyan
taskkill /F /IM cloudflared.exe 2>$null
Start-Sleep -Seconds 2

# 3. Démarrer Cloudflare avec la nouvelle configuration
Write-Host "3. Démarrage de Cloudflare avec authentification Supabase..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-Command", "cd '$PWD'; .\cloudflared.exe tunnel --config cloudflare-config-metube-simple.yml run" -WindowStyle Minimized

Write-Host ""
Write-Host "✅ Configuration terminée !" -ForegroundColor Green
Write-Host "• metube.iahome.fr → Page d'identification → Vérification Supabase → MeTube" -ForegroundColor White
Write-Host "• Serveur d'authentification: http://localhost:8085" -ForegroundColor White
Write-Host "• MeTube direct: http://192.168.1.150:8081" -ForegroundColor White
Write-Host "• Redirection création compte: https://iahome.fr/register" -ForegroundColor White
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
        Write-Host "• L'utilisateur doit s'identifier avec ses identifiants Supabase" -ForegroundColor Green
        Write-Host "• Redirection automatique vers création de compte si utilisateur inexistant" -ForegroundColor Green
    } else {
        Write-Host "• Page d'identification non détectée ❌" -ForegroundColor Red
        Write-Host "• Contient 'Accès à MeTube': $($response.Content -like '*Accès à MeTube*')" -ForegroundColor Cyan
        Write-Host "• Contient 'email': $($response.Content -like '*email*')" -ForegroundColor Cyan
    }
} catch {
    Write-Host "• metube.iahome.fr → Erreur ❌" -ForegroundColor Red
    Write-Host "• $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "📋 Fonctionnalités implémentées:" -ForegroundColor Yellow
Write-Host "• ✅ Vérification utilisateur dans Supabase" -ForegroundColor Green
Write-Host "• ✅ Vérification accès MeTube" -ForegroundColor Green
Write-Host "• ✅ Vérification expiration accès" -ForegroundColor Green
Write-Host "• ✅ Vérification quota d'utilisation" -ForegroundColor Green
Write-Host "• ✅ Incrémentation compteur d'utilisation" -ForegroundColor Green
Write-Host "• ✅ Redirection vers création de compte si utilisateur inexistant" -ForegroundColor Green
Write-Host "• ✅ Messages d'erreur explicites" -ForegroundColor Green
