# Script de test pour vérifier les utilisateurs avec accès LibreSpeed
Write-Host "👥 Test des utilisateurs avec accès LibreSpeed" -ForegroundColor Cyan

Write-Host "`n📋 Ce script vérifie les utilisateurs dans user_applications" -ForegroundColor Blue

# 1. Test de l'API de vérification des utilisateurs
Write-Host "`n1️⃣ Test de l'API de vérification des utilisateurs..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:443/api/list-users" -Headers @{"Host"="iahome.fr"} -UseBasicParsing -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API list-users accessible" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Nombre d'utilisateurs: $($content.users.Count)" -ForegroundColor Gray
        if ($content.users.Count -gt 0) {
            Write-Host "   Premier utilisateur: $($content.users[0].email)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ API list-users non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API list-users: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test de l'API de vérification des modules
Write-Host "`n2️⃣ Test de l'API de vérification des modules..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:443/api/check-modules" -Headers @{"Host"="iahome.fr"} -UseBasicParsing -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API check-modules accessible" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Modules trouvés: $($content.modules.Count)" -ForegroundColor Gray
        $librespeedModule = $content.modules | Where-Object { $_.id -eq "librespeed" }
        if ($librespeedModule) {
            Write-Host "   Module LibreSpeed trouvé: $($librespeedModule.title)" -ForegroundColor Gray
            Write-Host "   Visible: $($librespeedModule.is_visible)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ API check-modules non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API check-modules: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test de l'API de vérification des accès utilisateur
Write-Host "`n3️⃣ Test de l'API de vérification des accès utilisateur..." -ForegroundColor Yellow
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
                Write-Host "   Premier abonnement LibreSpeed: $($librespeedSubs[0].user_id)" -ForegroundColor Gray
            }
        }
    } else {
        Write-Host "❌ API check-subscriptions non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API check-subscriptions: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Test de l'API de santé avec vérification des utilisateurs
Write-Host "`n4️⃣ Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://localhost:443/api/health" -Headers @{"Host"="iahome.fr"} -UseBasicParsing -SkipCertificateCheck
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API de santé accessible" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Status: $($content.status)" -ForegroundColor Gray
        Write-Host "   Environment: $($content.environment)" -ForegroundColor Gray
    } else {
        Write-Host "❌ API de santé non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API de santé: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Vérification des logs récents
Write-Host "`n5️⃣ Vérification des logs récents..." -ForegroundColor Yellow
try {
    $logs = docker logs iahome-app --tail 20
    Write-Host "📋 Derniers logs de l'application:" -ForegroundColor Gray
    $logs | ForEach-Object { 
        if ($_ -match "user|User|module|Module|LibreSpeed|librespeed|subscription|Subscription") {
            Write-Host "   $_" -ForegroundColor Yellow
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erreur récupération logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test terminé !" -ForegroundColor Cyan
Write-Host "`n📋 Prochaines étapes:" -ForegroundColor Blue
Write-Host "   1. Vérifier s'il y a des utilisateurs dans user_applications" -ForegroundColor White
Write-Host "   2. Vérifier s'il y a des abonnements au module LibreSpeed" -ForegroundColor White
Write-Host "   3. Créer un accès utilisateur pour LibreSpeed si nécessaire" -ForegroundColor White
Write-Host "   4. Tester l'accès avec un utilisateur connecté" -ForegroundColor White