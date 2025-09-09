# Script de test - Génération et validation de token QR Codes
Write-Host "🔐 Test de génération et validation de token QR Codes" -ForegroundColor Green
Write-Host ""

Write-Host "🔍 Test de l'API de génération de token:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://iahome.fr/api/authorize-module-access" -Method POST -Body '{"moduleId":"qrcodes","moduleTitle":"QR Codes"}' -ContentType "application/json" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        $tokenData = $response.Content | ConvertFrom-Json
        if ($tokenData.success) {
            Write-Host "   ✅ Token généré avec succès" -ForegroundColor Green
            $token = $tokenData.token
            Write-Host "   🔑 Token: $($token.Substring(0, 20))..." -ForegroundColor Yellow
            
            Write-Host ""
            Write-Host "🔍 Test de validation du token avec QR Codes:" -ForegroundColor Cyan
            try {
                $validateResponse = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr/api/validate-token" -Method POST -Headers @{"Authorization" = "Bearer $token"; "Content-Type" = "application/json"} -UseBasicParsing -TimeoutSec 10
                if ($validateResponse.StatusCode -eq 200) {
                    $userInfo = $validateResponse.Content | ConvertFrom-Json
                    Write-Host "   ✅ Token validé avec succès" -ForegroundColor Green
                    Write-Host "   👤 Utilisateur: $($userInfo.userEmail)" -ForegroundColor Yellow
                } else {
                    Write-Host "   ❌ Erreur validation token: $($validateResponse.StatusCode)" -ForegroundColor Red
                }
            } catch {
                Write-Host "   ❌ Erreur lors de la validation: $($_.Exception.Message)" -ForegroundColor Red
            }
        } else {
            Write-Host "   ❌ Erreur génération token: $($tokenData.error)" -ForegroundColor Red
        }
    } else {
        Write-Host "   ❌ Erreur API authorize-module-access: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur lors de la génération de token: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🔍 Test de l'accès direct à QR Codes avec token:" -ForegroundColor Cyan
try {
    $response = Invoke-WebRequest -Uri "https://qrcodes.iahome.fr?auth_token=$token" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "   ✅ Accès QR Codes avec token réussi" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Erreur accès QR Codes: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur lors de l'accès QR Codes: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "✅ Test de token QR Codes terminé !" -ForegroundColor Green
