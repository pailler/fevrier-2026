# Script de configuration de la sécurité des sous-domaines IAHome
# Solution 2 : Worker Cloudflare (Gratuit)

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"
$AccountId = "9ba4294aa787e67c335c71876c10af21"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Configuration de la securisation des sous-domaines IAHome" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# 1. Lire le script Worker
Write-Host "`n1. Lecture du script Worker..." -ForegroundColor Yellow

if (Test-Path "worker-script.js") {
    $workerScript = Get-Content "worker-script.js" -Raw
    Write-Host "   Script Worker lu avec succes" -ForegroundColor Green
} else {
    Write-Host "   Fichier worker-script.js non trouve" -ForegroundColor Red
    exit 1
}

# 2. Creer le Worker de redirection
Write-Host "`n2. Creation du Worker de redirection..." -ForegroundColor Yellow

try {
    $workerResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/subdomain-redirect" -Method PUT -Headers $headers -Body $workerScript
    Write-Host "   Worker de redirection cree avec succes" -ForegroundColor Green
} catch {
    Write-Host "   Erreur creation Worker: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "   Le Worker existe deja, mise a jour..." -ForegroundColor Yellow
    }
}

# 3. Configurer les routes pour chaque sous-domaine
Write-Host "`n3. Configuration des routes de redirection..." -ForegroundColor Yellow

$subdomains = @("librespeed", "meeting-reports", "whisper", "comfyui", "stablediffusion", "qrcodes", "psitransfer", "metube", "pdf")

foreach ($subdomain in $subdomains) {
    Write-Host "   Configuration de $subdomain.iahome.fr..." -ForegroundColor Cyan
    
    $routeRule = @{
        pattern = "$subdomain.iahome.fr/*"
        script = "subdomain-redirect"
        enabled = $true
    } | ConvertTo-Json

    try {
        $routeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/workers/routes" -Method POST -Headers $headers -Body $routeRule
        Write-Host "   Route configuree pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   Route deja existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   Erreur route $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 4. Configurer les regles WAF pour bloquer les bots
Write-Host "`n4. Configuration des regles WAF..." -ForegroundColor Yellow

$wafRules = @(
    @{
        description = "Block bots and crawlers from subdomains"
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
Write-Host "   • Redirection automatique vers iahome.fr pour les acces directs" -ForegroundColor White
Write-Host "   • Blocage des bots, curl, wget" -ForegroundColor White
Write-Host "   • En-tetes de securite renforces" -ForegroundColor White
Write-Host "   • Page de redirection elegante avec compte a rebours" -ForegroundColor White

Write-Host "`nTest de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Redirige vers iahome.fr" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White
Write-Host "   • Acces via curl/wget → Bloque" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour etre active" -ForegroundColor Yellow
