# Script pour configurer le tunnel iahome-tunnel avec notre configuration
Write-Host "🔧 Configuration du tunnel iahome-tunnel..." -ForegroundColor Yellow

# Vérifier que le tunnel existe
Write-Host "🔍 Vérification du tunnel iahome-tunnel..." -ForegroundColor Cyan
try {
    $tunnelInfo = & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel info iahome-tunnel
    Write-Host "✅ Tunnel iahome-tunnel trouvé" -ForegroundColor Green
} catch {
    Write-Host "❌ Tunnel iahome-tunnel non trouvé: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Arrêter le tunnel actuel
Write-Host "🛑 Arrêt du tunnel iahome-tunnel..." -ForegroundColor Red
try {
    & "C:\Program Files (x86)\cloudflared\cloudflared.exe" tunnel stop iahome-tunnel
    Start-Sleep -Seconds 5
    Write-Host "✅ Tunnel arrêté" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Erreur lors de l'arrêt: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Démarrer le tunnel avec notre configuration
Write-Host "🚀 Démarrage du tunnel avec notre configuration..." -ForegroundColor Green
$configPath = (Get-Location).Path + "\cloudflared-config.yml"
Write-Host "   Configuration: $configPath" -ForegroundColor White

try {
    Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" -ArgumentList "tunnel", "--config", $configPath, "run" -WindowStyle Hidden
    Write-Host "✅ Tunnel démarré avec notre configuration" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que le tunnel démarre
Start-Sleep -Seconds 15

# Vérifier que le tunnel fonctionne
Write-Host "`n🧪 Test de la configuration..." -ForegroundColor Cyan

# Test 1: Accès direct sans token
Write-Host "Test 1: Accès direct sans token" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
        if ($response.Headers.Location -like "*login*") {
            Write-Host "✅ SUCCÈS: LibreSpeed redirige vers login!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ LibreSpeed redirige vers: $($response.Headers.Location)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ LibreSpeed ne redirige pas (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Accès avec token
Write-Host "`nTest 2: Accès avec token" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr?token=test_token" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    Write-Host "Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "Location: $($response.Headers.Location)" -ForegroundColor White
        if ($response.Headers.Location -like "*librespeed-secure*") {
            Write-Host "✅ SUCCÈS: LibreSpeed redirige vers l'application!" -ForegroundColor Green
        } else {
            Write-Host "⚠️ LibreSpeed redirige vers: $($response.Headers.Location)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ LibreSpeed ne redirige pas (Status: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration du tunnel terminée!" -ForegroundColor Green

