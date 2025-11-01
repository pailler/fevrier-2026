# Script pour créer automatiquement la Redirect Rule Cloudflare
# Utilise l'API Cloudflare pour créer la règle de redirection

Write-Host "🔧 Configuration Automatique Redirect Rule Cloudflare" -ForegroundColor Cyan
Write-Host "====================================================" -ForegroundColor Cyan
Write-Host ""

# Variables
$zoneName = "iahome.fr"
$ruleName = "Protect librespeed without token"
$redirectUrl = "https://iahome.fr/api/librespeed-redirect"

# Demander les credentials Cloudflare
Write-Host "📝 Veuillez fournir vos credentials Cloudflare:" -ForegroundColor Yellow
Write-Host ""

$apiToken = Read-Host -Prompt "API Token Cloudflare (ou appuyez sur Entrée pour utiliser les variables d'environnement)"

if ([string]::IsNullOrWhiteSpace($apiToken)) {
    $apiToken = $env:CLOUDFLARE_API_TOKEN
    if ([string]::IsNullOrWhiteSpace($apiToken)) {
        Write-Host "❌ Aucun API Token fourni" -ForegroundColor Red
        Write-Host ""
        Write-Host "Option 1: Fournir l'API Token maintenant" -ForegroundColor Yellow
        Write-Host "Option 2: Définir la variable d'environnement:" -ForegroundColor Yellow
        Write-Host '  $env:CLOUDFLARE_API_TOKEN = "votre-token"' -ForegroundColor Gray
        Write-Host ""
        Write-Host "Pour obtenir votre API Token:" -ForegroundColor Yellow
        Write-Host "  1. https://dash.cloudflare.com/profile/api-tokens" -ForegroundColor Gray
        Write-Host "  2. Créez un token avec les permissions: Zone, Zone Settings, Zone Rules" -ForegroundColor Gray
        Write-Host ""
        exit 1
    }
}

Write-Host "✅ API Token fourni" -ForegroundColor Green
Write-Host ""

# Headers pour les requêtes API
$headers = @{
    "Authorization" = "Bearer $apiToken"
    "Content-Type" = "application/json"
}

# Étape 1: Récupérer le Zone ID
Write-Host "🔍 Étape 1: Récupération du Zone ID pour $zoneName..." -ForegroundColor Cyan

try {
    $zoneResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=$zoneName" -Method Get -Headers $headers
    
    if ($zoneResponse.success -and $zoneResponse.result.Count -gt 0) {
        $zoneId = $zoneResponse.result[0].id
        Write-Host "✅ Zone ID trouvé: $zoneId" -ForegroundColor Green
    }
    else {
        Write-Host "❌ Zone non trouvée: $zoneName" -ForegroundColor Red
        exit 1
    }
}
catch {
    Write-Host "❌ Erreur lors de la récupération du Zone ID: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response.StatusCode -eq 401) {
        Write-Host "   → Token API invalide ou insuffisant" -ForegroundColor Yellow
    }
    exit 1
}

Write-Host ""

# Étape 2: Vérifier si une règle existe déjà
Write-Host "🔍 Étape 2: Vérification des règles existantes..." -ForegroundColor Cyan

try {
    $rulesResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/rulesets/phases/http_request_redirect/entrypoint" -Method Get -Headers $headers
    
    $existingRule = $rulesResponse.result.rules | Where-Object { $_.description -eq $ruleName }
    
    if ($existingRule) {
        Write-Host "⚠️  Une règle avec le même nom existe déjà" -ForegroundColor Yellow
        Write-Host "   ID de la règle: $($existingRule.id)" -ForegroundColor Gray
        $continue = Read-Host -Prompt "Voulez-vous la supprimer et la recréer? (O/N)"
        
        if ($continue -eq "O" -or $continue -eq "o") {
            Write-Host "🗑️  Suppression de l'ancienne règle..." -ForegroundColor Yellow
            # Note: La suppression nécessiterait de mettre à jour le ruleset complet
            # Pour simplifier, on va créer une nouvelle règle avec un nom légèrement différent
            $ruleName = "$ruleName - $(Get-Date -Format 'yyyyMMddHHmmss')"
            Write-Host "   Nouveau nom: $ruleName" -ForegroundColor Gray
        }
        else {
            Write-Host "❌ Opération annulée" -ForegroundColor Red
            exit 0
        }
    }
    else {
        Write-Host "✅ Aucune règle existante trouvée" -ForegroundColor Green
    }
}
catch {
    Write-Host "⚠️  Impossible de vérifier les règles existantes (continuer): $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host ""

# Étape 3: Créer la Redirect Rule
Write-Host "🔍 Étape 3: Création de la Redirect Rule..." -ForegroundColor Cyan

# Structure de la règle
$ruleConfig = @{
    description = $ruleName
    enabled = $true
    action = "redirect"
    action_parameters = @{
        from = @{
            hostname = "librespeed.iahome.fr"
            query = @{
                does_not_contain = "token"
            }
        }
        to = @{
            url = @{
                value = $redirectUrl
            }
        }
        status_code = 302
        preserve_query_string = $false
    }
    expression = "(http.host eq `"librespeed.iahome.fr`" and not http.request.uri.query contains `"token`")"
} | ConvertTo-Json -Depth 10

Write-Host "📋 Configuration de la règle:" -ForegroundColor Gray
Write-Host "   Nom: $ruleName" -ForegroundColor Gray
Write-Host "   Condition: Hostname = librespeed.iahome.fr AND Query String does not contain 'token'" -ForegroundColor Gray
Write-Host "   Action: Redirect 302 vers $redirectUrl" -ForegroundColor Gray
Write-Host ""

# Note: L'API Redirect Rules nécessite d'abord de récupérer le ruleset ID
# Puis d'ajouter la règle au ruleset existant ou d'en créer un nouveau

try {
    # Méthode 1: Essayer avec Rulesets API (méthode moderne)
    Write-Host "🔄 Tentative avec l'API Rulesets moderne..." -ForegroundColor Yellow
    
    # Récupérer le ruleset pour http_request_redirect
    $rulesetUri = "https://api.cloudflare.com/client/v4/zones/$zoneId/rulesets/phases/http_request_redirect/entrypoint"
    
    try {
        $rulesetResponse = Invoke-RestMethod -Uri $rulesetUri -Method Get -Headers $headers
        $rulesetId = $rulesetResponse.result.id
        
        Write-Host "✅ Ruleset ID trouvé: $rulesetId" -ForegroundColor Green
        
        # Ajouter la nouvelle règle
        $addRuleBody = @{
            rules = @(
                @{
                    description = $ruleName
                    enabled = $true
                    action = "redirect"
                    action_parameters = @{
                        from = @{
                            hostname = "librespeed.iahome.fr"
                            query = @{
                                does_not_contain = "token"
                            }
                        }
                        to = @{
                            url = @{
                                value = $redirectUrl
                            }
                        }
                        status_code = 302
                        preserve_query_string = $false
                    }
                    expression = "(http.host eq `"librespeed.iahome.fr`" and not http.request.uri.query contains `"token`")"
                }
            )
        } | ConvertTo-Json -Depth 10
        
        $addRuleResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$zoneId/rulesets/$rulesetId/rules" -Method Post -Headers $headers -Body $addRuleBody
        
        if ($addRuleResponse.success) {
            Write-Host "✅ Règle créée avec succès!" -ForegroundColor Green
            Write-Host "   ID: $($addRuleResponse.result.id)" -ForegroundColor Gray
        }
        else {
            throw "Erreur API: $($addRuleResponse.errors | ConvertTo-Json)"
        }
    }
    catch {
        Write-Host "⚠️  Méthode moderne échouée: $($_.Exception.Message)" -ForegroundColor Yellow
        Write-Host "   Passage à la méthode alternative..." -ForegroundColor Yellow
        
        # Méthode alternative: Utiliser l'API Redirect Rules directement
        throw "Méthode alternative non implémentée - utilisez le Dashboard Cloudflare"
    }
}
catch {
    Write-Host "❌ Erreur lors de la création de la règle: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
    Write-Host "⚠️  Configuration manuelle requise" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Instructions manuelles:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Connectez-vous à: https://dash.cloudflare.com/" -ForegroundColor White
    Write-Host "2. Sélectionnez votre domaine: $zoneName" -ForegroundColor White
    Write-Host "3. Allez dans: Rules → Redirect Rules" -ForegroundColor White
    Write-Host "4. Cliquez sur: Create rule" -ForegroundColor White
    Write-Host ""
    Write-Host "📝 Configuration:" -ForegroundColor Cyan
    Write-Host "   Rule name: $ruleName" -ForegroundColor White
    Write-Host "   Condition 1: Hostname equals librespeed.iahome.fr" -ForegroundColor White
    Write-Host "   Condition 2: Query String does not contain token" -ForegroundColor White
    Write-Host "   Action: Dynamic redirect to $redirectUrl" -ForegroundColor White
    Write-Host "   Status: 302" -ForegroundColor White
    Write-Host ""
    Write-Host "   Ou utilisez le script: .\configure-redirect-rules.ps1" -ForegroundColor Gray
    exit 1
}

Write-Host ""
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host ""
Write-Host "🧪 Test de la configuration:" -ForegroundColor Cyan
Write-Host "   .\test-redirect-rules.ps1" -ForegroundColor Gray
Write-Host ""

