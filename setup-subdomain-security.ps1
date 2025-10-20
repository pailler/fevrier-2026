# Script de configuration de la sécurité des sous-domaines
# Ce script configure plusieurs couches de protection

param(
    [string]$CloudflareApiToken = "",
    [string]$ZoneId = "",
    [string]$AccountId = ""
)

Write-Host "🔒 Configuration de la sécurité des sous-domaines IAHome" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

# Vérification des paramètres
if (-not $CloudflareApiToken -or -not $ZoneId -or -not $AccountId) {
    Write-Host "❌ Paramètres manquants. Utilisez :" -ForegroundColor Red
    Write-Host "   .\setup-subdomain-security.ps1 -CloudflareApiToken 'votre_token' -ZoneId 'votre_zone_id' -AccountId 'votre_account_id'" -ForegroundColor Yellow
    exit 1
}

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

# 1. Créer une page de redirection
Write-Host "`n1. Configuration de la page de redirection..." -ForegroundColor Yellow

# Créer un Worker Cloudflare pour la redirection
$workerScript = @"
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Vérifier si c'est un accès direct à un sous-domaine
  if (url.hostname.includes('.iahome.fr') && url.hostname !== 'iahome.fr') {
    // Rediriger vers la page de redirection
    return new Response(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès sécurisé requis - IAHome</title>
    <style>
        body { font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; }
        .container { background: white; border-radius: 20px; padding: 40px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; max-width: 500px; margin: 20px; }
        .icon { font-size: 64px; margin-bottom: 20px; }
        h1 { color: #1e40af; margin-bottom: 20px; font-size: 28px; }
        p { color: #6b7280; margin-bottom: 30px; line-height: 1.6; }
        .button { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 30px; border: none; border-radius: 10px; font-size: 16px; font-weight: 600; cursor: pointer; text-decoration: none; display: inline-block; transition: all 0.3s ease; }
        .button:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <h1>Accès sécurisé requis</h1>
        <p>Pour des raisons de sécurité, l'accès direct aux applications n'est pas autorisé. Veuillez utiliser l'interface principale d'IAHome.</p>
        <a href="https://iahome.fr/encours" class="button">🏠 Aller à IAHome</a>
    </div>
    <script>setTimeout(() => window.location.href = 'https://iahome.fr/encours', 5000);</script>
</body>
</html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff'
      }
    })
  }
  
  // Pour iahome.fr, laisser passer
  return fetch(request)
}
"@

try {
    $workerResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/subdomain-redirect" -Method PUT -Headers $headers -Body $workerScript
    Write-Host "   ✅ Worker de redirection créé" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur Worker: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Configurer les règles de routage
Write-Host "`n2. Configuration des règles de routage..." -ForegroundColor Yellow

$subdomains = @("librespeed", "meeting-reports", "whisper", "comfyui", "stablediffusion", "qrcodes", "psitransfer", "metube", "pdf")

foreach ($subdomain in $subdomains) {
    $routeRule = @{
        pattern = "$subdomain.iahome.fr/*"
        script = "subdomain-redirect"
        enabled = $true
    } | ConvertTo-Json

    try {
        $routeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/workers/routes" -Method POST -Headers $headers -Body $routeRule
        Write-Host "   ✅ Règle créée pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur règle $subdomain : $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Configurer les règles WAF
Write-Host "`n3. Configuration des règles WAF..." -ForegroundColor Yellow

$wafRules = @(
    @{
        description = "Block direct access to subdomains"
        expression = "(http.host contains `.iahome.fr`) and (http.host ne `iahome.fr`)"
        action = "challenge"
        enabled = $true
        priority = 1
    },
    @{
        description = "Block bots and crawlers"
        expression = "(http.user_agent contains `bot`) or (http.user_agent contains `crawler`) or (http.user_agent contains `spider`)"
        action = "block"
        enabled = $true
        priority = 2
    }
)

foreach ($rule in $wafRules) {
    try {
        $wafResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/firewall/rules" -Method POST -Headers $headers -Body ($rule | ConvertTo-Json)
        Write-Host "   ✅ Règle WAF créée: $($rule.description)" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur WAF: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 4. Configurer les en-têtes de sécurité
Write-Host "`n4. Configuration des en-têtes de sécurité..." -ForegroundColor Yellow

$transformRules = @(
    @{
        expression = "http.host contains `.iahome.fr` and http.host ne `iahome.fr`"
        enabled = $true
        description = "Security headers for subdomains"
        action = "rewrite"
        action_parameters = @{
            headers = @(
                @{ operation = "set"; name = "X-Frame-Options"; value = "DENY" },
                @{ operation = "set"; name = "X-Content-Type-Options"; value = "nosniff" },
                @{ operation = "set"; name = "Referrer-Policy"; value = "strict-origin-when-cross-origin" },
                @{ operation = "set"; name = "Content-Security-Policy"; value = "default-src 'self' https://iahome.fr; frame-ancestors 'none';" }
            )
        }
    }
)

foreach ($rule in $transformRules) {
    try {
        $transformResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/rulesets/transform" -Method POST -Headers $headers -Body ($rule | ConvertTo-Json -Depth 10)
        Write-Host "   ✅ En-têtes de sécurité configurés" -ForegroundColor Green
    } catch {
        Write-Host "   ❌ Erreur en-têtes: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host "`n🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "`n📋 Protection appliquée :" -ForegroundColor Cyan
Write-Host "   • Redirection automatique vers iahome.fr pour les accès directs" -ForegroundColor White
Write-Host "   • Blocage des bots et crawlers" -ForegroundColor White
Write-Host "   • En-têtes de sécurité renforcés" -ForegroundColor White
Write-Host "   • Challenge Cloudflare pour les accès suspects" -ForegroundColor White

Write-Host "`n🧪 Test de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Redirige vers iahome.fr" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White
Write-Host "   • Accès via curl/wget → Bloqué ou redirigé" -ForegroundColor White
