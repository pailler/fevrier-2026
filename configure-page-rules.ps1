# Script pour configurer les Page Rules Cloudflare
# Protection des sous-domaines via Page Rules

$CloudflareApiToken = "wkhkSnnSNWU8uNAkP0M0bqVrNRWlfTxU_5WCCSsG"
$ZoneId = "8e3782f7423cf8735c045eeabf8c6cf5"

$headers = @{
    "Authorization" = "Bearer $CloudflareApiToken"
    "Content-Type" = "application/json"
}

Write-Host "Configuration des Page Rules Cloudflare pour la protection des sous-domaines" -ForegroundColor Cyan
Write-Host "=================================================================================" -ForegroundColor Cyan

# 1. Lister les Page Rules existantes
Write-Host "`n1. Vérification des Page Rules existantes..." -ForegroundColor Yellow
try {
    $existingRules = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method GET -Headers $headers
    Write-Host "   Page Rules existantes: $($existingRules.result.Count)" -ForegroundColor Green
    
    foreach ($rule in $existingRules.result) {
        Write-Host "   - $($rule.targets[0].constraint.value) -> $($rule.actions[0].value)" -ForegroundColor White
    }
} catch {
    Write-Host "   Erreur lors de la récupération des Page Rules: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Créer la Page Rule pour la protection des sous-domaines
Write-Host "`n2. Création de la Page Rule de protection..." -ForegroundColor Yellow

$pageRuleData = @{
    targets = @(
        @{
            target = "url"
            constraint = @{
                operator = "matches"
                value = "*.iahome.fr/*"
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
    status = "active"
    priority = 1
} | ConvertTo-Json -Depth 10

try {
    $response = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method POST -Headers $headers -Body $pageRuleData
    Write-Host "   ✅ Page Rule créée avec succès" -ForegroundColor Green
    Write-Host "   ID: $($response.result.id)" -ForegroundColor White
} catch {
    if ($_.Exception.Message -like "*already exists*") {
        Write-Host "   ⚠️  Page Rule déjà existante" -ForegroundColor Yellow
    } else {
        Write-Host "   ❌ Erreur création Page Rule: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# 3. Vérifier la configuration finale
Write-Host "`n3. Vérification de la configuration finale..." -ForegroundColor Yellow
try {
    $finalRules = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/pagerules" -Method GET -Headers $headers
    Write-Host "   Page Rules actives: $($finalRules.result.Count)" -ForegroundColor Green
    
    foreach ($rule in $finalRules.result) {
        $target = $rule.targets[0].constraint.value
        $action = $rule.actions[0].value.url
        $status = $rule.status
        Write-Host "   - $target -> $action ($status)" -ForegroundColor White
    }
} catch {
    Write-Host "   Erreur lors de la vérification: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Configuration terminée !" -ForegroundColor Green
Write-Host "`nProtection appliquée :" -ForegroundColor Cyan
Write-Host "   • Tous les sous-domaines *.iahome.fr redirigent vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • Redirection 302 (temporaire)" -ForegroundColor White
Write-Host "   • Configuration via Page Rules Cloudflare" -ForegroundColor White
Write-Host "   • Solution 100% gratuite" -ForegroundColor White

Write-Host "`nTest de la protection :" -ForegroundColor Yellow
Write-Host "   • https://librespeed.iahome.fr → Redirection vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • https://meeting-reports.iahome.fr → Redirection vers iahome.fr/encours" -ForegroundColor White
Write-Host "   • https://iahome.fr → Fonctionne normalement" -ForegroundColor White

Write-Host "`nLa configuration peut prendre 2-3 minutes pour être active" -ForegroundColor Yellow
