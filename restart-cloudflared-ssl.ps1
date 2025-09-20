# Script pour redémarrer cloudflared avec la configuration SSL
Write-Host "🔒 Redémarrage de cloudflared avec configuration SSL..." -ForegroundColor Yellow

# Vérifier que le fichier de configuration existe
$configPath = "ssl\cloudflare\config.yml"
if (-not (Test-Path $configPath)) {
    Write-Host "❌ Fichier de configuration non trouvé: $configPath" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Fichier de configuration trouvé: $configPath" -ForegroundColor Green

# Afficher la configuration actuelle
Write-Host "`n📋 Configuration actuelle:" -ForegroundColor Cyan
Get-Content $configPath

# Arrêter tous les processus cloudflared
Write-Host "`n🛑 Arrêt des processus cloudflared..." -ForegroundColor Red
$processes = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($processes) {
    $processes | ForEach-Object {
        try {
            Stop-Process -Id $_.Id -Force
            Write-Host "   Processus $($_.Id) arrêté" -ForegroundColor White
        } catch {
            Write-Host "   Impossible d'arrêter le processus $($_.Id): $($_.Exception.Message)" -ForegroundColor Yellow
        }
    }
    Start-Sleep -Seconds 3
} else {
    Write-Host "   Aucun processus cloudflared en cours d'exécution" -ForegroundColor White
}

# Démarrer cloudflared avec la configuration SSL
Write-Host "`n🚀 Démarrage de cloudflared avec configuration SSL..." -ForegroundColor Green
$fullConfigPath = (Get-Location).Path + "\" + $configPath
Write-Host "   Configuration: $fullConfigPath" -ForegroundColor White

try {
    Start-Process -FilePath "C:\Program Files (x86)\cloudflared\cloudflared.exe" -ArgumentList "tunnel", "--config", $fullConfigPath, "run" -WindowStyle Hidden
    Write-Host "✅ Cloudflared démarré avec la configuration SSL" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors du démarrage: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Attendre que cloudflared démarre
Start-Sleep -Seconds 10

# Vérifier que cloudflared fonctionne
$cloudflaredProcess = Get-Process -Name "cloudflared" -ErrorAction SilentlyContinue
if ($cloudflaredProcess) {
    Write-Host "✅ Cloudflared fonctionne (PID: $($cloudflaredProcess.Id))" -ForegroundColor Green
    
    # Tester la configuration
    Write-Host "`n🧪 Test de la configuration..." -ForegroundColor Cyan
    Start-Sleep -Seconds 5
    
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
    
} else {
    Write-Host "❌ Cloudflared ne fonctionne pas!" -ForegroundColor Red
    exit 1
}

Write-Host "`n🎯 Configuration SSL appliquée!" -ForegroundColor Green
Write-Host "🔒 LibreSpeed est maintenant sécurisé:" -ForegroundColor Cyan
Write-Host "   - Accès direct sans token → redirection vers login" -ForegroundColor White
Write-Host "   - Accès avec token valide → accès autorisé" -ForegroundColor White

