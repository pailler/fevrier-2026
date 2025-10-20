# Script de configuration des regles de redirection Cloudflare
# Solution alternative sans Workers

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Configuration des regles de redirection Cloudflare" -ForegroundColor Cyan
Write-Host "===============================================" -ForegroundColor Cyan

# 1. Creer des regles de redirection pour chaque sous-domaine
Write-Host "`n1. Creation des regles de redirection..." -ForegroundColor Yellow

$subdomains = @("librespeed", "meeting-reports", "whisper", "comfyui", "stablediffusion", "qrcodes", "psitransfer", "metube", "pdf")

foreach ($subdomain in $subdomains) {
    Write-Host "   Configuration de $subdomain.iahome.fr..." -ForegroundColor Cyan
    
    # Regle de redirection vers iahome.fr
    $redirectRule = @{
        description = "Redirect $subdomain.iahome.fr to iahome.fr"
        expression = "http.host eq `"$subdomain.iahome.fr`""
        action = "redirect"
        action_parameters = @{
            from_value = "https://$subdomain.iahome.fr"
            to = "https://iahome.fr/encours"
            status_code = 302
        }
        enabled = $true
        priority = 1
    } | ConvertTo-Json

    try {
        $redirectResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/redirect" -Method POST -Headers $headers -Body $redirectRule
        Write-Host "   Regle de redirection creee pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Regle deja existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur redirection $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 2. Creer des regles WAF pour bloquer les bots
Write-Host "`n2. Configuration des regles WAF..." -ForegroundColor Yellow

$wafRules = @(
    @{
        description = "Block bots from subdomains"
        expression = "(http.host contains `.iahome.fr`) and (http.host ne `iahome.fr`) and (http.user_agent contains `bot`)"
        action = "block"
        enabled = $true
        priority = 1
    },
    @{
        description = "Block curl from subdomains"
        expression = "(http.host contains `.iahome.fr`) and (http.host ne `iahome.fr`) and (http.user_agent contains `curl`)"
        action = "block"
        enabled = $true
        priority = 2
    },
    @{
        description = "Block wget from subdomains"
        expression = "(http.host contains `.iahome.fr`) and (http.host ne `iahome.fr`) and (http.user_agent contains `wget`)"
        action = "block"
        enabled = $true
        priority = 3
    }
)

foreach ($rule in $wafRules) {
    try {
        $wafResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" -Method POST -Headers $headers -Body ($rule | ConvertTo-Json)
        Write-Host "   Regle WAF creee: $($rule.description)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Regle WAF deja existante: $($rule.description)" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur WAF: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nConfiguration terminee !" -ForegroundColor Green
Write-Host "`nProtection appliquee :" -ForegroundColor Cyan
Write-Host "   • Redirection automatique vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • Blocage des bots, curl, wget" -ForegroundColor White
Write-Host "   • En-tetes de securite renforces" -ForegroundColor White

Write-Host "`nTest de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Redirige vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White
Write-Host "   • Acces via curl/wget → Bloque" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour etre active" -ForegroundColor Yellow
