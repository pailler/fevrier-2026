# Script de test du système de redirection
Write-Host "🔗 Test du système de redirection des applications" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"

Write-Host "`n1. Test des APIs de redirection principales" -ForegroundColor Yellow

# Test LibreSpeed
Write-Host "`n📊 Test LibreSpeed Redirect:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/redirect-librespeed" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "   Redirection: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   Status: 302 (Redirection)" -ForegroundColor Green
        Write-Host "   Redirection: $location" -ForegroundColor White
    } else {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test MeTube
Write-Host "`n📊 Test MeTube Redirect:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/redirect-metube" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "   Redirection: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   Status: 302 (Redirection)" -ForegroundColor Green
        Write-Host "   Redirection: $location" -ForegroundColor White
    } else {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test StableDiffusion
Write-Host "`n📊 Test StableDiffusion Redirect:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/redirect-stablediffusion" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "   Redirection: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   Status: 302 (Redirection)" -ForegroundColor Green
        Write-Host "   Redirection: $location" -ForegroundColor White
    } else {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n2. Test des APIs de génération de tokens" -ForegroundColor Yellow

# Test LibreSpeed Token
Write-Host "`n🔑 Test LibreSpeed Token:" -ForegroundColor White
try {
    $tokenBody = @{
        userId = "test-user"
        userEmail = "test@example.com"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/librespeed-token" -Method POST -Body $tokenBody -ContentType "application/json"
    Write-Host "   Succès: $($response.success)" -ForegroundColor Green
    Write-Host "   Token: $($response.token.Substring(0, 10))..." -ForegroundColor White
} catch {
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test Generate Access Token
Write-Host "`n🔑 Test Generate Access Token:" -ForegroundColor White
try {
    $tokenBody = @{
        userId = "test-user"
        userEmail = "test@example.com"
        moduleId = "metube"
    } | ConvertTo-Json

    $response = Invoke-RestMethod -Uri "$baseUrl/api/generate-access-token" -Method POST -Body $tokenBody -ContentType "application/json"
    Write-Host "   Succès: $($response.success)" -ForegroundColor Green
    if ($response.token) {
        Write-Host "   Token: $($response.token.Substring(0, 10))..." -ForegroundColor White
    }
} catch {
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n3. Test des redirections avec tokens" -ForegroundColor Yellow

# Test LibreSpeed avec token
Write-Host "`n🔗 Test LibreSpeed avec token:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/redirect-librespeed?token=test-token" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "   Redirection: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   Status: 302 (Redirection)" -ForegroundColor Green
        Write-Host "   Redirection: $location" -ForegroundColor White
    } else {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test MeTube avec token
Write-Host "`n🔗 Test MeTube avec token:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/redirect-metube?token=test-token" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor White
    if ($response.Headers.Location) {
        Write-Host "   Redirection: $($response.Headers.Location)" -ForegroundColor White
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 302) {
        $location = $_.Exception.Response.Headers.Location
        Write-Host "   Status: 302 (Redirection)" -ForegroundColor Green
        Write-Host "   Redirection: $location" -ForegroundColor White
    } else {
        Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n4. Test des services de sécurité" -ForegroundColor Yellow

# Test Module Security Service
Write-Host "`n🔐 Test Module Security Service:" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/check-module-access" -Method POST -Body '{"userId":"test-user","moduleId":"metube"}' -ContentType "application/json"
    Write-Host "   Succès: $($response.success)" -ForegroundColor Green
    if ($response.usage_count) {
        Write-Host "   Usage: $($response.usage_count)/$($response.max_usage)" -ForegroundColor White
    }
} catch {
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

# Test LibreSpeed Access Service
Write-Host "`n🔐 Test LibreSpeed Access Service:" -ForegroundColor White
try {
    $response = Invoke-RestMethod -Uri "$baseUrl/api/check-librespeed-access" -Method POST -Body '{"userId":"test-user"}' -ContentType "application/json"
    Write-Host "   Accès: $($response.hasAccess)" -ForegroundColor Green
    if ($response.reason) {
        Write-Host "   Raison: $($response.reason)" -ForegroundColor White
    }
} catch {
    Write-Host "   Erreur: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n===============================================" -ForegroundColor Cyan
Write-Host "🎯 Tests du système de redirection terminés" -ForegroundColor Cyan
Write-Host "`nProblèmes identifiés:" -ForegroundColor Yellow
Write-Host "• LibreSpeed utilise un système de tokens différent" -ForegroundColor White
Write-Host "• Incohérence entre les APIs de redirection" -ForegroundColor White
Write-Host "• Certaines APIs peuvent ne pas fonctionner sans authentification" -ForegroundColor White
