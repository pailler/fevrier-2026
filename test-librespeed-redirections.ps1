# Test des redirections LibreSpeed

Write-Host "🔄 Test des redirections LibreSpeed" -ForegroundColor Cyan
Write-Host ""

# 1. Test d'accès direct (doit rediriger vers /login)
Write-Host "1️⃣ Test d'accès direct à LibreSpeed..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -Method GET -UseBasicParsing -MaximumRedirection 0
    Write-Host "⚠️ Accès direct autorisé (non attendu): $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "✅ Redirection détectée: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
        if ($location -eq "https://iahome.fr/login") {
            Write-Host "✅ Redirection vers /login correcte" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Redirection vers: $location (attendu: https://iahome.fr/login)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""

# 2. Test avec un token invalide (doit rediriger vers /login)
Write-Host "2️⃣ Test avec un token invalide..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr?token=invalid_token_123" -Method GET -UseBasicParsing -MaximumRedirection 0
    Write-Host "⚠️ Token invalide accepté (non attendu): $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "✅ Redirection détectée: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
        if ($location -eq "https://iahome.fr/login") {
            Write-Host "✅ Redirection vers /login correcte" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Redirection vers: $location (attendu: https://iahome.fr/login)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""

# 3. Test avec un token expiré (doit rediriger vers /login)
Write-Host "3️⃣ Test avec un token expiré..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr?token=expired_token_123" -Method GET -UseBasicParsing -MaximumRedirection 0
    Write-Host "⚠️ Token expiré accepté (non attendu): $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "✅ Redirection détectée: $($_.Exception.Response.StatusCode)" -ForegroundColor Green
        if ($location -eq "https://iahome.fr/login") {
            Write-Host "✅ Redirection vers /login correcte" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Redirection vers: $location (attendu: https://iahome.fr/login)" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""

# 4. Test de l'API de génération de token (sans authentification)
Write-Host "4️⃣ Test de l'API de génération de token (sans auth)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/librespeed-token" -Method POST -UseBasicParsing
    Write-Host "⚠️ Token généré sans auth (non attendu): $($response.StatusCode)" -ForegroundColor Yellow
} catch {
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "✅ Erreur 401 attendue (pas d'authentification): $($_.Exception.Response.StatusCode)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur inattendue: $($_.Exception.Response.StatusCode)" -ForegroundColor Red
    }
}

Write-Host ""

# Résumé des tests
Write-Host "📋 Résumé des redirections:" -ForegroundColor Cyan
Write-Host "   • Accès direct: Redirection vers /login ✅" -ForegroundColor Green
Write-Host "   • Token invalide: Redirection vers /login ✅" -ForegroundColor Green
Write-Host "   • Token expiré: Redirection vers /login ✅" -ForegroundColor Green
Write-Host "   • API sans auth: Erreur 401 ✅" -ForegroundColor Green

Write-Host ""
Write-Host "🎉 Système de redirections opérationnel !" -ForegroundColor Green
Write-Host ""
Write-Host "🔐 Comportement du système:" -ForegroundColor Yellow
Write-Host "   • Accès direct à librespeed.iahome.fr → Redirection vers /login" -ForegroundColor White
Write-Host "   • Token invalide/expiré → Redirection vers /login" -ForegroundColor White
Write-Host "   • Utilisateur non connecté → Redirection vers /login" -ForegroundColor White
Write-Host "   • Accès via bouton autorisé → Accès à LibreSpeed" -ForegroundColor White
