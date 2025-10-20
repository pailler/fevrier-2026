# Script de configuration de la protection intelligente
# Bloque l'accès direct mais permet l'accès avec tokens

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Configuration de la protection intelligente des sous-domaines" -ForegroundColor Cyan
Write-Host "=======================================================" -ForegroundColor Cyan

# 1. Creer des regles WAF intelligentes pour chaque sous-domaine
Write-Host "`n1. Creation des regles WAF intelligentes..." -ForegroundColor Yellow

$subdomains = @("librespeed", "meeting-reports", "whisper", "comfyui", "stablediffusion", "qrcodes", "psitransfer", "metube", "pdf")

foreach ($subdomain in $subdomains) {
    Write-Host "   Configuration de $subdomain.iahome.fr..." -ForegroundColor Cyan
    
    # Regle 1: Bloquer l'acces direct (sans token et sans referer iahome.fr)
    $rule1 = @{
        description = "Block direct access to $subdomain (no token, no referer)"
        expression = "(http.host eq `"$subdomain.iahome.fr`") and not (http.request.uri.query contains `"token`") and not (http.referer contains `"iahome.fr`")"
        action = "block"
        enabled = $true
        priority = 1
        response = @{
            status_code = 302
            headers = @{
                Location = "https://iahome.fr/encours"
            }
        }
    } | ConvertTo-Json -Depth 10

    try {
        $response1 = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" -Method POST -Headers $headers -Body $rule1
        Write-Host "   Regle 1 creee pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Regle 1 deja existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur regle 1 $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Regle 2: Bloquer les bots
    $rule2 = @{
        description = "Block bots from $subdomain"
        expression = "(http.host eq `"$subdomain.iahome.fr`") and (http.user_agent contains `"bot`")"
        action = "block"
        enabled = $true
        priority = 2
    } | ConvertTo-Json

    try {
        $response2 = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" -Method POST -Headers $headers -Body $rule2
        Write-Host "   Regle 2 creee pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Regle 2 deja existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur regle 2 $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }

    # Regle 3: Bloquer curl/wget
    $rule3 = @{
        description = "Block curl/wget from $subdomain"
        expression = "(http.host eq `"$subdomain.iahome.fr`") and (http.user_agent contains `"curl`" or http.user_agent contains `"wget`")"
        action = "block"
        enabled = $true
        priority = 3
    } | ConvertTo-Json

    try {
        $response3 = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" -Method POST -Headers $headers -Body $rule3
        Write-Host "   Regle 3 creee pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Regle 3 deja existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur regle 3 $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nConfiguration terminee !" -ForegroundColor Green
Write-Host "`nProtection appliquee :" -ForegroundColor Cyan
Write-Host "   • Acces direct bloque (sans token, sans referer iahome.fr)" -ForegroundColor White
Write-Host "   • Acces avec token autorise" -ForegroundColor White
Write-Host "   • Acces via iahome.fr autorise" -ForegroundColor White
Write-Host "   • Bots, curl, wget bloques" -ForegroundColor White

Write-Host "`nTest de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Bloque (redirection vers iahome.fr)" -ForegroundColor White
Write-Host "   • https://librespeed.iahome.fr?token=abc123 → Fonctionne" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White
Write-Host "   • Acces via curl/wget → Bloque" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour etre active" -ForegroundColor Yellow
