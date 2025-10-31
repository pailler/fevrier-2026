# Script pour purger le cache Cloudflare via API ou instructions manuelles

Write-Host "🗑️ Purge du cache Cloudflare..." -ForegroundColor Cyan
Write-Host ""

# Variables
$AccountId = "9ba4294aa787e67c335c71876c10af21"
$CloudflareApiToken = $env:CLOUDFLARE_API_TOKEN

# 1. Vérifier le token API
if (-not $CloudflareApiToken) {
    Write-Host "⚠️ CLOUDFLARE_API_TOKEN non défini" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 INSTRUCTIONS POUR PURGER LE CACHE MANUELLEMENT:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Méthode 1 : Via le Dashboard Cloudflare (Recommandé)" -ForegroundColor Yellow
    Write-Host "   1. Connectez-vous à https://dash.cloudflare.com/" -ForegroundColor Gray
    Write-Host "   2. Sélectionnez votre zone: iahome.fr" -ForegroundColor Gray
    Write-Host "   3. Allez dans 'Mise en cache' > 'Configuration'" -ForegroundColor Gray
    Write-Host "   4. Cliquez sur 'Purger tout' ou 'Purger par URL'" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Méthode 2 : Via l'API (si vous avez un token)" -ForegroundColor Yellow
    Write-Host "   1. Créez un token API dans Cloudflare Dashboard" -ForegroundColor Gray
    Write-Host "   2. Permissions: Zone > Zone Settings > Edit" -ForegroundColor Gray
    Write-Host "   3. Ajoutez dans env.production.local:" -ForegroundColor Gray
    Write-Host "      CLOUDFLARE_API_TOKEN=votre_token_ici" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Méthode 3 : Purge par URL spécifique" -ForegroundColor Yellow
    Write-Host "   Utilisez l'API curl avec votre token:" -ForegroundColor Gray
    Write-Host '   curl -X POST "https://api.cloudflare.com/client/v4/zones/ZONE_ID/purge_cache" \' -ForegroundColor Gray
    Write-Host '        -H "Authorization: Bearer YOUR_API_TOKEN" \' -ForegroundColor Gray
    Write-Host '        -H "Content-Type: application/json" \' -ForegroundColor Gray
    Write-Host '        --data ''{"purge_everything":true}''' -ForegroundColor Gray
    Write-Host ""
    exit 0
}

# 2. Récupérer la Zone ID
Write-Host "🔍 Récupération de la Zone ID pour iahome.fr..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $CloudflareApiToken"
        "Content-Type" = "application/json"
    }
    
    $zonesResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones?name=iahome.fr" -Method GET -Headers $headers -ErrorAction Stop
    
    if ($zonesResponse.success -and $zonesResponse.result.Count -gt 0) {
        $ZoneId = $zonesResponse.result[0].id
        Write-Host "   ✅ Zone ID: $ZoneId" -ForegroundColor Green
    } else {
        Write-Host "   ❌ Zone non trouvée" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "   ❌ Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# 3. Purger tout le cache
Write-Host "`n🗑️ Purge complète du cache Cloudflare..." -ForegroundColor Yellow
try {
    $headers = @{
        "Authorization" = "Bearer $CloudflareApiToken"
        "Content-Type" = "application/json"
    }
    
    $purgeBody = @{
        purge_everything = $true
    } | ConvertTo-Json
    
    $purgeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" -Method POST -Headers $headers -Body $purgeBody -ErrorAction Stop
    
    if ($purgeResponse.success) {
        Write-Host "   ✅ Cache Cloudflare vidé avec succès!" -ForegroundColor Green
        Write-Host "   📊 ID de purge: $($purgeResponse.result.id)" -ForegroundColor Gray
    } else {
        Write-Host "   ❌ Erreur: $($purgeResponse.errors)" -ForegroundColor Red
    }
} catch {
    Write-Host "   ❌ Erreur API: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorContent = $_.ErrorDetails.Message | ConvertFrom-Json -ErrorAction SilentlyContinue
        if ($errorContent) {
            Write-Host "   Détails: $($errorContent.errors)" -ForegroundColor Yellow
        }
    }
}

# 4. Purger par URL (pour être sûr)
Write-Host "`n🗑️ Purge du cache par URL (supplémentaire)..." -ForegroundColor Yellow
$domains = @(
    "https://iahome.fr",
    "https://www.iahome.fr",
    "https://qrcodes.iahome.fr",
    "https://librespeed.iahome.fr"
)

try {
    $headers = @{
        "Authorization" = "Bearer $CloudflareApiToken"
        "Content-Type" = "application/json"
    }
    
    $purgeBody = @{
        files = $domains
    } | ConvertTo-Json
    
    $purgeResponse = Invoke-RestMethod -Uri "https://api.cloudflare.com/client/v4/zones/$ZoneId/purge_cache" -Method POST -Headers $headers -Body $purgeBody -ErrorAction Stop
    
    if ($purgeResponse.success) {
        Write-Host "   ✅ Cache vidé pour les URLs spécifiées" -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ Erreur: $($purgeResponse.errors)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "   ⚠️ Erreur: $($_.Exception.Message)" -ForegroundColor Yellow
}

Write-Host "`n✅ Purge terminée!" -ForegroundColor Green

