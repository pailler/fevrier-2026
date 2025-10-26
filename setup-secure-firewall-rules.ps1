# Script de configuration des règles Firewall Cloudflare
# Objectif : Bloquer l'accès direct, autoriser avec token

param(
    [string]$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN,
    [string]$ZoneId = "bdca897ab94ef46a1f9c8f655c8dc97e"
)

if (-not $CloudflareApiToken) {
    Write-Host "❌ Variable CLOUDFLARE_API_TOKEN non définie" -ForegroundColor Red
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "🔐 Configuration des règles de sécurité Cloudflare..." -ForegroundColor Cyan

# Sous-domaines à protéger
$subdomains = @(
    "librespeed",
    "meeting-reports", 
    "whisper",
    "comfyui",
    "stablediffusion",
    "qrcodes",
    "psitransfer",
    "metube",
    "pdf",
    "ruinedfooocus",
    "cogstudio"
)

foreach ($subdomain in $subdomains) {
    Write-Host "`n🛡️ Configuration pour $subdomain.iahome.fr..." -ForegroundColor Yellow
    
    # RÈGLE 1 : Autoriser avec token
    $ruleName = "$subdomain-allow-with-token"
    $expression = "(http.host eq `"$subdomain.iahome.fr`" and http.request.uri.query contains `"token=`")"
    
    $allowRule = @{
        action = "allow"
        expression = $expression
        description = "Autoriser $subdomain avec token"
        paused = $false
    } | ConvertTo-Json -Depth 10
    
    try {
        Write-Host "  📝 Création règle: Autoriser avec token..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" `
            -Method Post `
            -Headers $headers `
            -Body $allowRule
        
        if ($response.success) {
            Write-Host "  ✅ Règle 'Autoriser' créée (ID: $($response.result.id))" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Erreur: $($response.errors | ConvertTo-Json)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Erreur création règle allow: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  ℹ️ Règle existe déjà (ignoré)" -ForegroundColor Gray
        }
    }
    
    # RÈGLE 2 : Bloquer sans token (Cloudflare ne supporte pas redirect dans Firewall Rules)
    # Note: Redirect doit être fait via Transform Rules ou Page Rules
    $blockRuleName = "$subdomain-block-direct"
    $blockExpression = "(http.host eq `"$subdomain.iahome.fr`" and not http.request.uri.query contains `"token=`")"
    
    $blockRule = @{
        action = "block"
        expression = $blockExpression
        description = "Bloquer $subdomain sans token (utiliser Page Rule pour redirection)"
        paused = $false
    } | ConvertTo-Json -Depth 10
    
    try {
        Write-Host "  📝 Création règle: Bloquer sans token..." -ForegroundColor Cyan
        $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" `
            -Method Post `
            -Headers $headers `
            -Body $blockRule
        
        if ($response.success) {
            Write-Host "  ✅ Règle 'Bloquer' créée (ID: $($response.result.id))" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Erreur: $($response.errors | ConvertTo-Json)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Erreur création règle block: $($_.Exception.Message)" -ForegroundColor Red
        if ($_.Exception.Response.StatusCode -eq 409) {
            Write-Host "  ℹ️ Règle existe déjà (ignoré)" -ForegroundColor Gray
        }
    }
    
    # CRÉATION PAGE RULE POUR LA REDIRECTION
    try {
        Write-Host "  📝 Création Page Rule pour redirection..." -ForegroundColor Cyan
        
        $pageRule = @{
            targets = @(
                @{
                    target = "url"
                    constraint = @{
                        operator = "matches"
                        value = "$subdomain.iahome.fr/*"
                    }
                }
            )
            actions = @(
                @{
                    id = "forwarding_url"
                    value = @{
                        url = "https://iahome.fr"
                        status_code = 301
                    }
                }
            )
            priority = 10
            status = "active"
        } | ConvertTo-Json -Depth 10
        
        $redirectResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" `
            -Method Post `
            -Headers $headers `
            -Body $pageRule
        
        if ($redirectResponse.success) {
            Write-Host "  ✅ Page Rule créée (redirection vers iahome.fr)" -ForegroundColor Green
        } else {
            Write-Host "  ⚠️ Erreur Page Rule: $($redirectResponse.errors | ConvertTo-Json)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "  ❌ Erreur création Page Rule: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "  ℹ️ Créez-la manuellement dans le Dashboard" -ForegroundColor Gray
    }
}

Write-Host "`n✅ Configuration terminée !" -ForegroundColor Green
Write-Host "🧪 Testez l'accès sans token (devrait être bloqué)" -ForegroundColor Cyan
Write-Host "🧪 Testez l'accès avec token depuis le bouton (devrait fonctionner)" -ForegroundColor Cyan

