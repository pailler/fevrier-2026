# Script de test pour la sécurisation LibreSpeed
Write-Host "🔒 Test de sécurisation LibreSpeed - iahome.fr" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# Test 1: Accès direct bloqué
Write-Host "`n1. Test d'accès direct à librespeed.iahome.fr (doit être bloqué)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 403) {
        Write-Host "✅ Accès direct correctement bloqué (403)" -ForegroundColor Green
    } else {
        Write-Host "❌ Accès direct non bloqué - Status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 403) {
        Write-Host "✅ Accès direct correctement bloqué (403)" -ForegroundColor Green
    } else {
        Write-Host "❌ Erreur lors du test d'accès direct: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 2: Redirection vers l'API
Write-Host "`n2. Test de redirection vers l'API de redirection" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://librespeed.iahome.fr" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    if ($response.Headers.Location -like "*iahome.fr/api/redirect-librespeed*") {
        Write-Host "✅ Redirection correcte vers l'API" -ForegroundColor Green
    } else {
        Write-Host "❌ Redirection incorrecte: $($response.Headers.Location)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        if ($location -like "*iahome.fr/api/redirect-librespeed*") {
            Write-Host "✅ Redirection correcte vers l'API" -ForegroundColor Green
        } else {
            Write-Host "❌ Redirection incorrecte: $location" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erreur lors du test de redirection: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: API de redirection
Write-Host "`n3. Test de l'API de redirection (sans authentification)" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/redirect-librespeed" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    if ($response.Headers.Location -like "*iahome.fr/login*") {
        Write-Host "✅ Redirection vers login correcte" -ForegroundColor Green
    } else {
        Write-Host "❌ Redirection vers login incorrecte: $($response.Headers.Location)" -ForegroundColor Red
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        if ($location -like "*iahome.fr/login*") {
            Write-Host "✅ Redirection vers login correcte" -ForegroundColor Green
        } else {
            Write-Host "❌ Redirection vers login incorrecte: $location" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Erreur lors du test de l'API: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Page de blocage
Write-Host "`n4. Test de la page de blocage" -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/librespeed-blocked" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 403 -and $response.Content -like "*Accès Direct Bloqué*") {
        Write-Host "✅ Page de blocage fonctionne correctement" -ForegroundColor Green
    } else {
        Write-Host "❌ Page de blocage ne fonctionne pas correctement" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Erreur lors du test de la page de blocage: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "🎯 Tests de sécurisation LibreSpeed terminés" -ForegroundColor Cyan
Write-Host "`nPour tester l'accès autorisé:" -ForegroundColor Yellow
Write-Host "1. Connectez-vous à https://iahome.fr" -ForegroundColor White
Write-Host "2. Allez dans la section 'En cours'" -ForegroundColor White
Write-Host "3. Cliquez sur le module LibreSpeed" -ForegroundColor White
Write-Host "4. Vous serez redirigé avec un token valide" -ForegroundColor White