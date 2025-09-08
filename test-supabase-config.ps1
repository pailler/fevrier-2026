# Script de test pour vérifier la configuration Supabase après exécution du SQL
Write-Host "🧪 Test de la configuration Supabase pour LibreSpeed" -ForegroundColor Cyan

# 1. Test de l'API de visibilité du module
Write-Host "`n1️⃣ Test de l'API de visibilité du module..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80/api/test-module-visibility" -Headers @{"Host"="iahome.fr"} -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API de visibilité accessible" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Module trouvé: $($content.success)" -ForegroundColor Gray
        if ($content.module) {
            Write-Host "   ID: $($content.module.id)" -ForegroundColor Gray
            Write-Host "   Titre: $($content.module.title)" -ForegroundColor Gray
            Write-Host "   Visible: $($content.module.is_visible)" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ API de visibilité non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur API de visibilité: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Test de l'interface LibreSpeed
Write-Host "`n2️⃣ Test de l'interface LibreSpeed..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80/librespeed-interface" -Headers @{"Host"="iahome.fr"} -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Interface LibreSpeed accessible" -ForegroundColor Green
        if ($response.Content -match "Vérification de l'accès") {
            Write-Host "   Interface affiche le message de vérification" -ForegroundColor Gray
        }
        if ($response.Content -match "animate-spin") {
            Write-Host "   Spinner de chargement affiché" -ForegroundColor Gray
        }
    } else {
        Write-Host "❌ Interface LibreSpeed non accessible (Code: $($response.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur interface LibreSpeed: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Test de l'API de santé
Write-Host "`n3️⃣ Test de l'API de santé..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:80/api/health" -Headers @{"Host"="iahome.fr"} -UseBasicParsing
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

# 4. Vérification des logs de l'application
Write-Host "`n4️⃣ Vérification des logs de l'application..." -ForegroundColor Yellow
try {
    $logs = docker logs iahome-app --tail 20
    Write-Host "📋 Derniers logs de l'application:" -ForegroundColor Gray
    $logs | ForEach-Object { 
        if ($_ -match "LibreSpeed|librespeed|Module|module|is_visible|image_url|temporairement|désactivée") {
            Write-Host "   $_" -ForegroundColor Yellow
        } else {
            Write-Host "   $_" -ForegroundColor Gray
        }
    }
} catch {
    Write-Host "❌ Erreur récupération logs: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Test de configuration terminé!" -ForegroundColor Cyan
Write-Host "`n📋 Instructions:" -ForegroundColor Blue
Write-Host "   1. Exécuter le script SQL dans Supabase: setup-supabase-librespeed.sql" -ForegroundColor White
Write-Host "   2. Relancer ce script pour vérifier la configuration" -ForegroundColor White
Write-Host "   3. Tester l'accès via le bouton sur /encours" -ForegroundColor White
Write-Host "`n🔧 Après configuration Supabase:" -ForegroundColor Blue
Write-Host "   - Réactiver les vérifications dans check-auth/route.ts" -ForegroundColor White
Write-Host "   - Réactiver les vérifications dans librespeed-interface/page.tsx" -ForegroundColor White
Write-Host "   - Tester l'accès complet avec authentification" -ForegroundColor White

