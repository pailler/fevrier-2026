# Script de diagnostic pour le problème de token LibreSpeed

Write-Host "🔍 Diagnostic du problème de token LibreSpeed" -ForegroundColor Cyan
Write-Host ""

# 1. Vérifier si l'utilisateur est connecté
Write-Host "1️⃣ Test de connexion utilisateur..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/check-auth" -Method GET -UseBasicParsing
    Write-Host "✅ API check-auth accessible: $($response.StatusCode)" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur API check-auth: $_" -ForegroundColor Red
}

Write-Host ""

# 2. Test de génération de token (sans authentification)
Write-Host "2️⃣ Test de génération de token (sans cookies)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/librespeed-token" -Method POST -UseBasicParsing
    Write-Host "⚠️ Token généré sans cookies (non attendu): $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Erreur 401 attendue (pas de cookies): $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Vérifier les logs de l'application
Write-Host "3️⃣ Vérification des logs de l'application..." -ForegroundColor Yellow
try {
    $logs = docker logs iahome-app --tail 20 2>&1
    Write-Host "📋 Derniers logs de l'application:" -ForegroundColor Gray
    $logs | ForEach-Object { Write-Host "   $_" -ForegroundColor Gray }
} catch {
    Write-Host "❌ Impossible de récupérer les logs: $_" -ForegroundColor Red
}

Write-Host ""

# 4. Test de la base de données
Write-Host "4️⃣ Test de la base de données..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/check-auth?test-db=true" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "✅ Test de base de données réussi" -ForegroundColor Green
        Write-Host "📊 Modules trouvés: $($data.data.stats.totalModules)" -ForegroundColor Gray
        Write-Host "📊 Accès LibreSpeed: $($data.data.stats.librespeedAccess)" -ForegroundColor Gray
    } else {
        Write-Host "❌ Erreur test base de données: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur test base de données: $_" -ForegroundColor Red
}

Write-Host ""

# 5. Vérifier si la table librespeed_tokens existe
Write-Host "5️⃣ Vérification de la table librespeed_tokens..." -ForegroundColor Yellow
Write-Host "📝 Pour créer la table, exécutez le script SQL:" -ForegroundColor Cyan
Write-Host "   create-librespeed-tokens-table.sql" -ForegroundColor White

Write-Host ""

# 6. Instructions de résolution
Write-Host "🔧 Instructions de résolution:" -ForegroundColor Yellow
Write-Host "   1. Exécuter le script SQL dans Supabase:" -ForegroundColor White
Write-Host "      - Ouvrir Supabase Dashboard" -ForegroundColor Gray
Write-Host "      - Aller dans SQL Editor" -ForegroundColor Gray
Write-Host "      - Exécuter le contenu de create-librespeed-tokens-table.sql" -ForegroundColor Gray
Write-Host ""
Write-Host "   2. Redémarrer l'application:" -ForegroundColor White
Write-Host "      docker-compose restart iahome-app" -ForegroundColor Gray
Write-Host ""
Write-Host "   3. Tester à nouveau:" -ForegroundColor White
Write-Host "      - Aller sur /encours" -ForegroundColor Gray
Write-Host "      - Cliquer sur 'Accéder à l'application' pour LibreSpeed" -ForegroundColor Gray

Write-Host ""
Write-Host "🎯 Diagnostic terminé !" -ForegroundColor Green
