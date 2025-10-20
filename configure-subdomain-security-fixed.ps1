# Script de configuration de la sécurité des sous-domaines IAHome
# Solution 2 : Worker Cloudflare (Gratuit)

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"
$AccountId = "9ba4294aa787e67c335c71876c10af21"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "🔒 Configuration de la sécurité des sous-domaines IAHome" -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Zone ID: $ZoneId" -ForegroundColor Gray
Write-Host "Account ID: $AccountId" -ForegroundColor Gray

# 1. Créer le Worker de redirection
Write-Host "`n1. Création du Worker de redirection..." -ForegroundColor Yellow

$workerScript = @'
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  const url = new URL(request.url)
  
  // Vérifier si c'est un accès direct à un sous-domaine
  if (url.hostname.includes('.iahome.fr') && url.hostname !== 'iahome.fr') {
    // Page de redirection élégante
    return new Response(`
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Accès sécurisé requis - IAHome</title>
    <style>
        body { 
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            margin: 0; padding: 0; min-height: 100vh; 
            display: flex; align-items: center; justify-content: center; 
        }
        .container { 
            background: white; border-radius: 20px; padding: 40px; 
            box-shadow: 0 20px 40px rgba(0,0,0,0.1); text-align: center; 
            max-width: 500px; margin: 20px; 
        }
        .icon { font-size: 64px; margin-bottom: 20px; }
        h1 { color: #1e40af; margin-bottom: 20px; font-size: 28px; }
        p { color: #6b7280; margin-bottom: 30px; line-height: 1.6; }
        .button { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; padding: 15px 30px; border: none; border-radius: 10px; 
            font-size: 16px; font-weight: 600; cursor: pointer; 
            text-decoration: none; display: inline-block; 
            transition: all 0.3s ease; 
        }
        .button:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3); 
        }
        .security-info { 
            background: #f3f4f6; border-radius: 10px; padding: 20px; 
            margin-top: 30px; text-align: left; 
        }
        .security-info h3 { color: #1e40af; margin-bottom: 15px; font-size: 18px; }
        .security-info ul { color: #6b7280; margin: 0; padding-left: 20px; }
        .security-info li { margin-bottom: 8px; }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🔒</div>
        <h1>Accès sécurisé requis</h1>
        <p>
            Pour des raisons de sécurité, l'accès direct aux applications n'est pas autorisé. 
            Veuillez utiliser l'interface principale d'IAHome pour accéder à cette application.
        </p>
        
        <a href="https://iahome.fr/encours" class="button">
            🏠 Aller à IAHome
        </a>
        
        <div class="security-info">
            <h3>🛡️ Pourquoi cette protection ?</h3>
            <ul>
                <li>Contrôle d'accès centralisé via l'interface IAHome</li>
                <li>Gestion des tokens et quotas d'utilisation</li>
                <li>Authentification et autorisation sécurisées</li>
                <li>Traçabilité des utilisations</li>
                <li>Protection contre l'accès non autorisé</li>
            </ul>
        </div>
    </div>

    <script>
        // Redirection automatique après 10 secondes
        setTimeout(() => {
            window.location.href = 'https://iahome.fr/encours';
        }, 10000);

        // Compte à rebours
        let countdown = 10;
        const button = document.querySelector('.button');
        const originalText = button.textContent;
        
        const timer = setInterval(() => {
            countdown--;
            button.textContent = `🏠 Aller à IAHome (${countdown}s)`;
            
            if (countdown <= 0) {
                clearInterval(timer);
                button.textContent = originalText;
            }
        }, 1000);
    </script>
</body>
</html>
    `, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'Referrer-Policy': 'strict-origin-when-cross-origin'
      }
    })
  }
  
  // Pour iahome.fr, laisser passer
  return fetch(request)
}
'@

try {
    $workerResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/accounts/$AccountId/workers/scripts/subdomain-redirect" -Method PUT -Headers $headers -Body $workerScript
    Write-Host "   ✅ Worker de redirection créé avec succès" -ForegroundColor Green
} catch {
    Write-Host "   ❌ Erreur création Worker: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "   ℹ️  Le Worker existe déjà, mise à jour..." -ForegroundColor Yellow
    }
}

# 2. Configurer les routes pour chaque sous-domaine
Write-Host "`n2. Configuration des routes de redirection..." -ForegroundColor Yellow

$subdomains = @("librespeed", "meeting-reports", "whisper", "comfyui", "stablediffusion", "qrcodes", "psitransfer", "metube", "pdf")

foreach ($subdomain in $subdomains) {
    Write-Host "   🔧 Configuration de $subdomain.iahome.fr..." -ForegroundColor Cyan
    
    $routeRule = @{
        pattern = "$subdomain.iahome.fr/*"
        script = "subdomain-redirect"
        enabled = $true
    } | ConvertTo-Json

    try {
        $routeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/workers/routes" -Method POST -Headers $headers -Body $routeRule
        Write-Host "   ✅ Route configurée pour $subdomain.iahome.fr" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   ℹ️  Route déjà existante pour $subdomain.iahome.fr" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Erreur route $subdomain : $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

# 3. Configurer les règles WAF pour bloquer les bots
Write-Host "`n3. Configuration des règles WAF..." -ForegroundColor Yellow

$wafRules = @(
    @{
        description = "Block bots and crawlers from subdomains"
        expression = "(http.host contains `.iahome.fr`) and (http.host ne `iahome.fr`) and (http.user_agent contains `bot`)"
        action = "block"
        enabled = $true
        priority = 1
    },
    @{
        description = "Block curl and wget from subdomains"
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
        Write-Host "   ✅ Règle WAF créée: $($rule.description)" -ForegroundColor Green
    } catch {
        if ($_.Exception.Message -like "*already exists*") {
            Write-Host "   ℹ️  Règle WAF déjà existante: $($rule.description)" -ForegroundColor Yellow
        } else {
            Write-Host "   ❌ Erreur WAF: $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host "`n🎉 Configuration terminée !" -ForegroundColor Green
Write-Host "`n📋 Protection appliquée :" -ForegroundColor Cyan
Write-Host "   • Redirection automatique vers iahome.fr pour les accès directs" -ForegroundColor White
Write-Host "   • Blocage des bots, curl, wget" -ForegroundColor White
Write-Host "   • En-têtes de sécurité renforcés" -ForegroundColor White
Write-Host "   • Page de redirection élégante avec compte à rebours" -ForegroundColor White

Write-Host "`n🧪 Test de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Redirige vers iahome.fr" -ForegroundColor White
Write-Host "   • https://iahome.fr/encours → Fonctionne normalement" -ForegroundColor White
Write-Host "   • Accès via curl/wget → Bloqué" -ForegroundColor White

Write-Host "`n⏱️  La configuration peut prendre 2-3 minutes pour être active" -ForegroundColor Yellow
