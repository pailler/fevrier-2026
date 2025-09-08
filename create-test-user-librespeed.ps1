# Script pour créer un utilisateur de test avec accès LibreSpeed
Write-Host "👤 Création d'un utilisateur de test pour LibreSpeed" -ForegroundColor Cyan

Write-Host "`n📋 Ce script va créer un accès utilisateur de test pour LibreSpeed" -ForegroundColor Blue

# 1. Test de l'API de création d'utilisateur
Write-Host "`n1️⃣ Test de l'API de création d'utilisateur..." -ForegroundColor Yellow
try {
    $userData = @{
        email = "test@librespeed.com"
        user_id = "test-user-librespeed-001"
        module_id = "librespeed"
        module_title = "LibreSpeed"
        access_level = "full"
        is_active = $true
        expires_at = (Get-Date).AddYears(1).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
        usage_count = 0
        max_usage = 100
    } | ConvertTo-Json

    $response = Invoke-WebRequest -Uri "https://localhost:443/api/force-activate-module" -Method POST -Body $userData -ContentType "application/json" -Headers @{"Host"="iahome.fr"} -UseBasicParsing -SkipCertificateCheck
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Utilisateur de test créé avec succès" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Response: $($content.message)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur création utilisateur (Code: $($response.StatusCode))" -ForegroundColor Red
        Write-Host "   Response: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "❌ Erreur API création utilisateur: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        Write-Host "   Status Code: $($_.Exception.Response.StatusCode)" -ForegroundColor Gray
        try {
            $errorContent = $_.Exception.Response.Content | ConvertFrom-Json
            Write-Host "   Error: $($errorContent.message)" -ForegroundColor Gray
        } catch {
            Write-Host "   Raw Error: $($_.Exception.Response.Content)" -ForegroundColor Gray
        }
    }
}

# 2. Test de l'API de vérification des modules après création
Write-Host "`n2️⃣ Test de l'API de vérification des modules..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:443/api/check-modules" -Headers @{"Host"="iahome.fr"} -UseBasicParsing -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API check-modules accessible" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Modules trouvés: $($content.modules.Count)" -ForegroundColor Gray
        $librespeedModule = $content.modules | Where-Object { $_.id -eq "librespeed" }
        if ($librespeedModule) {
            Write-Host "   Module LibreSpeed: $($librespeedModule.title)" -ForegroundColor Gray
            Write-Host "   Visible: $($librespeedModule.is_visible)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ API check-modules non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API check-modules: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test de l'API de vérification des abonnements
Write-Host "`n3️⃣ Test de l'API de vérification des abonnements..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:443/api/check-subscriptions" -Headers @{"Host"="iahome.fr"} -UseBasicParsing -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API check-subscriptions accessible" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Abonnements trouvés: $($content.subscriptions.Count)" -ForegroundColor Gray
        if ($content.subscriptions.Count -gt 0) {
            $librespeedSubs = $content.subscriptions | Where-Object { $_.module_id -eq "librespeed" }
            Write-Host "   Abonnements LibreSpeed: $($librespeedSubs.Count)" -ForegroundColor Gray
            if ($librespeedSubs.Count -gt 0) {
                Write-Host "   Premier abonnement: $($librespeedSubs[0].user_id)" -ForegroundColor Gray
                Write-Host "   Actif: $($librespeedSubs[0].is_active)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ API check-subscriptions non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API check-subscriptions: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Vérification des logs
Write-Host "`n4️⃣ Vérification des logs..." -ForegroundColor Yellow
try {
    $logs = docker logs iahome-app --tail 15
    Write-Host "📋 Derniers logs de l'application:" -ForegroundColor Gray
    $logs | ForEach-Object { 
        if ($_ -match "user|User|module|Module|LibreSpeed|librespeed|subscription|Subscription|test") {
            Write-Host "   $_" -ForegroundColor Yellow
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erreur récupération logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test terminé !" -ForegroundColor Cyan
Write-Host "`n📋 Résumé:" -ForegroundColor Blue
Write-Host "   - Tentative de création d'un utilisateur de test pour LibreSpeed" -ForegroundColor White
Write-Host "   - Vérification des modules et abonnements" -ForegroundColor White
Write-Host "   - Si l'utilisateur est créé, l'interface LibreSpeed devrait fonctionner" -ForegroundColor White

Write-Host "`n🔧 Pour tester l'interface LibreSpeed:" -ForegroundColor Blue
Write-Host "   1. Aller sur https://iahome.fr/login" -ForegroundColor White
Write-Host "   2. Se connecter avec le compte de test" -ForegroundColor White
Write-Host "   3. Aller sur https://iahome.fr/encours" -ForegroundColor White
Write-Host "   4. Cliquer sur le bouton 'Accéder à l'application' du module LibreSpeed" -ForegroundColor White

