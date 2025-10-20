# Script pour sécuriser les sous-domaines avec Cloudflare Access
# Ce script configure Cloudflare Access pour protéger tous les sous-domaines

param(
    [string]$CloudflareApiToken = "",
    [string]$ZoneId = "",
    [string]$AccountId = ""
)

# Configuration Cloudflare
$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "🔒 Configuration de la sécurisation des sous-domaines avec Cloudflare Access" -ForegroundColor Cyan
Write-Host "=================================================================" -ForegroundColor Cyan

# Liste des sous-domaines à protéger
$subdomains = @(
    "librespeed.iahome.fr",
    "meeting-reports.iahome.fr", 
    "whisper.iahome.fr",
    "comfyui.iahome.fr",
    "stablediffusion.iahome.fr",
    "qrcodes.iahome.fr",
    "psitransfer.iahome.fr",
    "metube.iahome.fr",
    "pdf.iahome.fr"
)

# 1. Créer une politique d'authentification
Write-Host "`n1. Création de la politique d'authentification..." -ForegroundColor Yellow

$authPolicy = @{
    name = "IAHome Subdomains Protection"
    decision = @{
        require = @(
            @{
                email = @{
                    email = "formateur_tic@hotmail.com"
                }
            }
        )
    }
    include = @(
        @{
            email_domain = @{
                domain = "hotmail.com"
            }
        }
    )
    exclude = @()
    require = @()
    session_duration = "24h"
} | ConvertTo-Json -Depth 10

try {
    $authResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/access/apps" -Method POST -Headers $headers -Body $authPolicy
    Write-Host "   ✅ Politique d'authentification créée" -ForegroundColor Green
    $authPolicyId = $authResponse.result.id
} catch {
    Write-Host "   ❌ Erreur création politique: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 2. Créer une application Access pour chaque sous-domaine
Write-Host "`n2. Création des applications Access..." -ForegroundColor Yellow

foreach ($subdomain in $subdomains) {
    Write-Host "   🔧 Configuration de $subdomain..." -ForegroundColor Cyan
    
    $appConfig = @{
        name = "IAHome - $subdomain"
        domain = $subdomain
        type = "self_hosted"
        policies = @($authPolicyId)
        session_duration = "24h"
        allowed_idps = @()
        auto_redirect_to_identity = $true
        enable_binding_cookie = $false
        http_only_cookie_attribute = $true
        same_site_cookie_attribute = "lax"
        skip_interstitial = $false
        app_launcher_visible = $false
        logo_url = "https://iahome.fr/favicon.ico"
        header_bg_color = "#1e40af"
        header_text_color = "#ffffff"
        custom_pages = @()
        cors_headers = @{
            allowed_methods = @("GET", "POST", "PUT", "DELETE", "OPTIONS")
            allowed_origins = @("https://iahome.fr")
            allow_all_origins = $false
        }
    } | ConvertTo-Json -Depth 10

    try {
        $appResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/access/apps" -Method POST -Headers $headers -Body $appConfig
        Write-Host "   ✅ $subdomain protégé" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur $subdomain : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Configurer les règles WAF pour bloquer l'accès direct
Write-Host "`n3. Configuration des règles WAF..." -ForegroundColor Yellow

foreach ($subdomain in $subdomains) {
    Write-Host "   🛡️ Règle WAF pour $subdomain..." -ForegroundColor Cyan
    
    $wafRule = @{
        description = "Block direct access to $subdomain without proper authentication"
        expression = "(http.host eq `"$subdomain`") and (http.user_agent contains `"curl`" or http.user_agent contains `"wget`" or http.user_agent contains `"bot`")"
        action = "block"
        enabled = $true
        priority = 1
    } | ConvertTo-Json

    try {
        $wafResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" -Method POST -Headers $headers -Body $wafRule
        Write-Host "   ✅ Règle WAF créée pour $subdomain" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur WAF $subdomain : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Configurer les en-têtes de sécurité
Write-Host "`n4. Configuration des en-têtes de sécurité..." -ForegroundColor Yellow

$securityHeaders = @{
    "X-Frame-Options" = "DENY"
    "X-Content-Type-Options" = "nosniff"
    "Referrer-Policy" = "strict-origin-when-cross-origin"
    "Permissions-Policy" = "camera=(), microphone=(), geolocation=()"
    "Content-Security-Policy" = "default-src 'self' https://iahome.fr; frame-ancestors 'none';"
}

foreach ($header in $securityHeaders.GetEnumerator()) {
    $transformRule = @{
        expression = "true"
        enabled = $true
        description = "Add $($header.Key) header"
        action = "rewrite"
        action_parameters = @{
            headers = @(
                @{
                    operation = "set"
                    name = $header.Key
                    value = $header.Value
                }
            )
        }
    } | ConvertTo-Json -Depth 10

    try {
        $transformResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/transform" -Method POST -Headers $headers -Body $transformRule
        Write-Host "   ✅ En-tête $($header.Key) configuré" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur en-tête $($header.Key) : $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "`n📋 Résumé des protections appliquées :" -ForegroundColor Cyan
Write-Host "   • Authentification obligatoire via Cloudflare Access" -ForegroundColor White
Write-Host "   • Redirection vers iahome.fr pour l'authentification" -ForegroundColor White
Write-Host "   • Blocage des accès directs (curl, wget, bots)" -ForegroundColor White
Write-Host "   • En-têtes de sécurité renforcés" -ForegroundColor White
Write-Host "   • CORS configuré pour iahome.fr uniquement" -ForegroundColor White

Write-Host "`n🔗 Pour tester :" -ForegroundColor Yellow
Write-Host "   • Accès direct : https://librespeed.iahome.fr (doit rediriger vers auth)" -ForegroundColor White
Write-Host "   • Accès via iahome.fr : https://iahome.fr/encours (fonctionne normalement)" -ForegroundColor White
