# Script de test du système de redirection unifié
Write-Host "🔗 Test du système de redirection unifié" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan

$baseUrl = "https://iahome.fr"

Write-Host "`n1. Test des redirections sans authentification" -ForegroundColor Yellow

# Test LibreSpeed
Write-Host "`n📊 Test LibreSpeed (sans auth):" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=librespeed" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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
Write-Host "`n📊 Test MeTube (sans auth):" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=metube" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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
Write-Host "`n📊 Test StableDiffusion (sans auth):" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=stablediffusion" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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

Write-Host "`n2. Test des redirections avec tokens" -ForegroundColor Yellow

# Test LibreSpeed avec token
Write-Host "`n🔑 Test LibreSpeed avec token:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=librespeed&token=test-token" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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
Write-Host "`n🔑 Test MeTube avec token:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=metube&token=test-token" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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

Write-Host "`n3. Test des modules non supportés" -ForegroundColor Yellow

# Test module inexistant
Write-Host "`n❌ Test module inexistant:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=inexistant" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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

# Test sans module
Write-Host "`n❌ Test sans module:" -ForegroundColor White
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect" -UseBasicParsing -TimeoutSec 10 -MaximumRedirection 0
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

Write-Host "`n4. Test de tous les modules supportés" -ForegroundColor Yellow

$modules = @('librespeed', 'metube', 'pdf', 'psitransfer', 'qrcodes', 'converter', 'stablediffusion', 'ruinedfooocus', 'invoke', 'comfyui', 'cogstudio', 'sdnext')

foreach ($module in $modules) {
    Write-Host "`n📱 Test $module:" -ForegroundColor White
    try {
        $response = Invoke-WebRequest -Uri "$baseUrl/api/unified-redirect?module=$module" -UseBasicParsing -TimeoutSec 5 -MaximumRedirection 0
        Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Green
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
}

Write-Host "`n=======================================" -ForegroundColor Cyan
Write-Host "🎯 Tests du système unifié terminés" -ForegroundColor Cyan
Write-Host "`nLe système de redirection unifié est maintenant disponible !" -ForegroundColor Green
Write-Host "`nURL d'utilisation: /api/unified-redirect?module=MODULE_ID" -ForegroundColor Yellow
Write-Host "`nModules supportés: $($modules -join ', ')" -ForegroundColor White
