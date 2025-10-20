# Script de configuration des Page Rules Cloudflare
# Solution simple avec redirections

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Configuration des Page Rules Cloudflare" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan

# 1. Creer des Page Rules pour chaque sous-domaine
Write-Host "`n1. Creation des Page Rules..." -ForegroundColor Yellow

$subdomains = @("librespeed", "meeting-reports", "whisper", "comfyui", "stablediffusion", "qrcodes", "psitransfer", "metube", "pdf")

foreach ($subdomain in $subdomains) {
    Write-Host "   Configuration de $subdomain.iahome.fr..." -ForegroundColor Cyan
    
    # Page Rule pour rediriger vers iahome.fr
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
                    url = "https://iahome.fr/encours"
                    status_code = 302
                }
            }
        )
        priority = 1
        status = "active"
    } | ConvertTo-Json -Depth 10

    try {
        $pageRuleResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method POST -Headers $headers -Body $pageRule
        Write-Host "   Page Rule creee pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Page Rule deja existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur Page Rule $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`nConfiguration terminee !" -ForegroundColor Green
Write-Host "`nProtection appliquee :" -ForegroundColor Cyan
Write-Host "   • Redirection automatique vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • Protection des sous-domaines" -ForegroundColor White

Write-Host "`nTest de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Redirige vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour etre active" -ForegroundColor Yellow
