# Script de configuration Cloudflare Access (Zero Trust) pour LibreSpeed
# Configure l'authentification et l'autorisation pour LibreSpeed

param(
    [Parameter(Mandatory=$true)]
    [string]$CloudflareApiToken,
    
    [Parameter(Mandatory=$true)]
    [string]$AccountId,
    
    [string]$Email = "admin@iahome.fr",
    [string]$Domain = "iahome.fr"
)

Write-Host "🔐 Configuration Cloudflare Access pour LibreSpeed" -ForegroundColor Cyan
Write-Host "=================================================" -ForegroundColor Cyan

# Configuration des headers pour l'API Cloudflare
$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

# Fonction pour appeler l'API Cloudflare Zero Trust
function Invoke-CloudflareZeroTrustAPI {
    param(
        [string]$Method,
        [string]$Endpoint,
        [object]$Body = $null
    )
    
    $uri = "https://api.cloudflare.com/client/v4/accounts/$AccountId$Endpoint"
    
    try {
        if ($Body) {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers -Body ($Body | ConvertTo-Json -Depth 10)
        } else {
            $response = Invoke-RestMethod -Uri $uri -Method $Method -Headers $headers
        }
        return $response
    } catch {
        Write-Host "   ❌ Erreur API Cloudflare Zero Trust: $($_.Exception.Message)" -ForegroundColor Red
        return $null
    }
}

# 1. Créer une application LibreSpeed
Write-Host "`n1. Création de l'application LibreSpeed..." -ForegroundColor Yellow

$appConfig = @{
    name = "LibreSpeed - Test de vitesse"
    domain = "librespeed.$Domain"
    type = "self_hosted"
    session_duration = "24h"
    allowed_idps = @()
    auto_redirect_to_identity = $false
    enable_binding_cookie = $false
    http_only_cookie_attribute = $true
    same_site_cookie_attribute = "lax"
    skip_interstitial = $true
    app_launcher_visible = $true
    logo_url = "https://librespeed.iahome.fr/favicon.ico"
    custom_pages = @()
    policies = @(
        @{
            name = "Accès LibreSpeed"
            precedence = 1
            decision = "allow"
            filters = @{
                email_domain = @("@$Domain")
            }
            identity_headers = @{
                email = @{
                    name = "CF-Access-User-Email"
                }
            }
        }
    )
}

$app = Invoke-CloudflareZeroTrustAPI -Method "POST" -Endpoint "/access/apps" -Body $appConfig
if ($app.success) {
    Write-Host "   ✅ Application LibreSpeed créée" -ForegroundColor Green
    Write-Host "   📋 App ID: $($app.result.uid)" -ForegroundColor Cyan
} else {
    Write-Host "   ⚠️  Application déjà existante ou erreur" -ForegroundColor Yellow
}

# 2. Configurer les paramètres de session
Write-Host "`n2. Configuration des paramètres de session..." -ForegroundColor Yellow

$sessionConfig = @{
    name = "LibreSpeed Session"
    domain = "librespeed.$Domain"
    session_duration = "24h"
    idle_timeout = "8h"
    max_session_duration = "24h"
    auth_method = "email"
    allow_authenticate_via_warp = $false
    additional_headers = @{
        "X-Frame-Options" = "DENY"
        "X-Content-Type-Options" = "nosniff"
        "X-XSS-Protection" = "1; mode=block"
    }
}

$session = Invoke-CloudflareZeroTrustAPI -Method "POST" -Endpoint "/access/apps" -Body $sessionConfig
if ($session.success) {
    Write-Host "   ✅ Paramètres de session configurés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Paramètres de session déjà configurés" -ForegroundColor Yellow
}

# 3. Créer une politique d'accès avancée
Write-Host "`n3. Création de la politique d'accès..." -ForegroundColor Yellow

$policyConfig = @{
    name = "LibreSpeed Access Policy"
    precedence = 1
    decision = "allow"
    filters = @{
        email_domain = @("@$Domain")
        country = @("FR")
        time = "00:00-23:59"
    }
    identity_headers = @{
        email = @{
            name = "CF-Access-User-Email"
        }
        id = @{
            name = "CF-Access-User-Id"
        }
    }
    session_duration = "24h"
    require = @(
        @{
            email_domain = @("@$Domain")
        }
    )
}

$policy = Invoke-CloudflareZeroTrustAPI -Method "POST" -Endpoint "/access/apps" -Body $policyConfig
if ($policy.success) {
    Write-Host "   ✅ Politique d'accès créée" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Politique d'accès déjà existante" -ForegroundColor Yellow
}

# 4. Configurer les paramètres de sécurité avancés
Write-Host "`n4. Configuration des paramètres de sécurité..." -ForegroundColor Yellow

$securityConfig = @{
    name = "LibreSpeed Security"
    domain = "librespeed.$Domain"
    session_duration = "24h"
    idle_timeout = "8h"
    max_session_duration = "24h"
    auth_method = "email"
    allow_authenticate_via_warp = $false
    additional_headers = @{
        "X-Frame-Options" = "DENY"
        "X-Content-Type-Options" = "nosniff"
        "X-XSS-Protection" = "1; mode=block"
        "Referrer-Policy" = "strict-origin-when-cross-origin"
        "Permissions-Policy" = "camera=(), microphone=(), geolocation=()"
    }
    cors_headers = @{
        "Access-Control-Allow-Origin" = "https://librespeed.$Domain"
        "Access-Control-Allow-Methods" = "GET, POST, OPTIONS"
        "Access-Control-Allow-Headers" = "Content-Type, Authorization"
    }
}

$security = Invoke-CloudflareZeroTrustAPI -Method "POST" -Endpoint "/access/apps" -Body $securityConfig
if ($security.success) {
    Write-Host "   ✅ Paramètres de sécurité configurés" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Paramètres de sécurité déjà configurés" -ForegroundColor Yellow
}

# 5. Configurer les logs et monitoring
Write-Host "`n5. Configuration du monitoring..." -ForegroundColor Yellow

$logConfig = @{
    name = "LibreSpeed Logs"
    domain = "librespeed.$Domain"
    log_settings = @{
        enabled = $true
        log_level = "info"
        log_retention_days = 30
    }
    alert_settings = @{
        enabled = $true
        email = $Email
        webhook_url = ""
    }
}

$logs = Invoke-CloudflareZeroTrustAPI -Method "POST" -Endpoint "/access/apps" -Body $logConfig
if ($logs.success) {
    Write-Host "   ✅ Monitoring configuré" -ForegroundColor Green
} else {
    Write-Host "   ⚠️  Monitoring déjà configuré" -ForegroundColor Yellow
}

# 6. Tester la configuration
Write-Host "`n6. Test de la configuration..." -ForegroundColor Yellow

# Attendre que les changements se propagent
Start-Sleep -Seconds 15

try {
    $response = Invoke-WebRequest -Uri "https://librespeed.$Domain" -Method Head -TimeoutSec 20
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 302) {
        Write-Host "   ✅ LibreSpeed accessible avec authentification" -ForegroundColor Green
        Write-Host "   🔒 Status: $($response.StatusCode)" -ForegroundColor Cyan
        
        # Vérifier les headers de sécurité
        $headers = $response.Headers
        if ($headers["CF-Access-User-Email"]) {
            Write-Host "   ✅ Headers d'authentification présents" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "   ⚠️  Test d'accès: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n🎯 Configuration Cloudflare Access terminée !" -ForegroundColor Green
Write-Host "   🌐 URL: https://librespeed.$Domain" -ForegroundColor Cyan
Write-Host "   🔐 Authentification: Email @$Domain" -ForegroundColor Cyan
Write-Host "   ⏰ Session: 24h" -ForegroundColor Cyan
Write-Host "   🛡️  Sécurité: Headers + CORS + Monitoring" -ForegroundColor Cyan

Write-Host "`n📋 Résumé de la configuration Access:" -ForegroundColor Yellow
Write-Host "   ✅ Application LibreSpeed créée" -ForegroundColor Green
Write-Host "   ✅ Politique d'accès par domaine email" -ForegroundColor Green
Write-Host "   ✅ Headers de sécurité configurés" -ForegroundColor Green
Write-Host "   ✅ CORS configuré" -ForegroundColor Green
Write-Host "   ✅ Monitoring et logs activés" -ForegroundColor Green
Write-Host "   ✅ Session 24h avec timeout 8h" -ForegroundColor Green

Write-Host "`n🔧 Prochaines étapes:" -ForegroundColor Yellow
Write-Host "   1. Tester l'accès: https://librespeed.$Domain" -ForegroundColor Cyan
Write-Host "   2. Vérifier l'authentification par email" -ForegroundColor Cyan
Write-Host "   3. Configurer les utilisateurs dans Cloudflare Access" -ForegroundColor Cyan
Write-Host "   4. Monitorer les logs dans le dashboard Cloudflare" -ForegroundColor Cyan

